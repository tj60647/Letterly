import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

const SYSTEM_INSTRUCTION = `
Act as an expert writer and editor. 
Produce ONLY the content of the letter. Do not include introductory text like "Here is your letter:".
Do not add additional content or make up details beyond what is provided in the key points.
Maintain the requested tone throughout.
Ensure the flow is logical and polished.
If the rough draft is fragmented, expand it into full coherent sentences.
Use standard letter formatting (salutation, body, closing).
`;

export async function POST(req: NextRequest) {
    console.log("POST /api/generate called");
    try {
        const body = await req.json();
        const { recipient, sender, tone, length, language, roughNotes, styleExample, model } = body;

        const fullPrompt = `
      FROM: ${sender || "[Sender Name]"}
      TO: ${recipient || "[Recipient Name]"}
      TONE: ${tone}
      LENGTH: ${length}
      OUTPUT LANGUAGE: ${language || "English"}

      ROUGH NOTES / KEY POINTS:
      ${roughNotes}

      ${styleExample ? `STYLE REFERENCE (Mimic this writing style): ${styleExample}` : ""}
    `;

        console.log("Generating with OpenRouter model:", model);
        console.log("Rough Notes:", roughNotes);

        const openai = createOpenAIClient();
        
        const agent = { ...AGENTS.GENERATE };
        if (model) agent.primary = model;

        try {
            const response = await callWithFallback(
                openai, 
                [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: fullPrompt }
                ],
                agent
            );

            return NextResponse.json({ 
                text: response.content,
                usedModel: response.usedModel 
            });

        } catch (err: unknown) {
            console.error("OpenRouter API Error:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to generate content via OpenRouter";
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
    } catch (error: unknown) {
        console.error("Request Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to process request.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
