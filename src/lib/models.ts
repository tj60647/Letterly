import OpenAI from "openai";
import { AGENTS, MODELS } from "@/lib/agent-constants";

export { AGENTS, MODELS };

export type AgentConfig = {
    primary: string;
    fallbacks: readonly string[];
};

export const createOpenAIClient = () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    return new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        defaultHeaders: {
            "HTTP-Referer": siteUrl,
            "X-Title": "Letterly",
        },
    });
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function callWithFallback(
    openai: OpenAI, 
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], 
    agent: AgentConfig,
    responseFormat: OpenAI.Chat.Completions.ChatCompletionCreateParams['response_format'] | undefined = undefined
) {
    const { primary, fallbacks } = agent;
    
    // Deduplicate
    const attemptOrder = [primary, ...fallbacks.filter(f => f !== primary)];
    
    let lastError = null;

    for (const model of attemptOrder) {
        try {
            const completion = await openai.chat.completions.create({
                model,
                messages,
                response_format: responseFormat
            });

            return {
                content: completion.choices[0].message.content || "",
                usedModel: model
            };
        } catch (error: unknown) {
            const err = error as { status?: number; code?: string | number };
            console.warn(`Model ${model} failed with ${err?.status || err?.code}.`);
            lastError = error;
            
            // If it's a rate limit or server error, wait briefly and continue to next fallback
            if (err?.status === 429 || (typeof err?.status === 'number' && err.status >= 500)) {
                await delay(1000); // 1s cooldown
                continue;
            }
            
            // If it's a client error (400, 401), don't retry other models
            throw error;
        }
    }

    throw lastError || new Error("All models failed");
}
