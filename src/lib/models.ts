/**
 * @file src/lib/models.ts
 * @description Utility functions for initializing OpenAI/OpenRouter clients and handling resilient API calls with fallbacks.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: API Clients, Error Handling, Fallback Logic
 */

import OpenAI from "openai";
import { AGENTS, MODELS } from "@/lib/agent-constants";

export { AGENTS, MODELS };

export type AgentConfig = {
    primary: string;
    fallbacks: readonly string[];
};

/**
 * Creates a configured OpenAI client instance using the OpenRouter API.
 * 
 * @returns {OpenAI} An initialized OpenAI client ready to make requests.
 * @throws {Error} If the OPENROUTER_API_KEY environment variable is missing.
 * 
 * @example
 * const client = createOpenAIClient();
 * // Use client.chat.completions.create(...)
 */
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

/**
 * Makes an API call to an LLM with automatic fallback support.
 * If the primary model fails (e.g., is down or overloaded), it automatically tries the next model in the list.
 * 
 * @param {OpenAI} openai - The initialized OpenAI client.
 * @param {OpenAI.Chat.Completions.ChatCompletionMessageParam[]} messages - The list of messages to send to the AI (system prompt, user prompt, etc.).
 * @param {AgentConfig} agent - The configuration object for the agent, containing the primary model and fallbacks.
 * @param {OpenAI.Chat.Completions.ChatCompletionCreateParams['response_format']} [responseFormat] - Optional format instruction (e.g., { type: "json_object" }).
 * 
 * @returns {Promise<{content: string, usedModel: string}>} The generated text and the name of the model that successfully generated it.
 * @throws {Error} If all models in the list fail.
 */
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
