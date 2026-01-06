import { NextRequest, NextResponse } from "next/server";
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

export async function POST(req: NextRequest) {
    console.log("POST /api/refine called");
    try {
        const body = await req.json();
        const { roughNotes, instructions, conversationHistory, model } = body;

        // Format conversation history if available
        let historyContext = "";
        if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
            historyContext = "\n\nPREVIOUS CONVERSATION:\n" + conversationHistory
                .filter((msg: { role: string }) => msg.role === 'user') // Only include user requests to avoid noise
                .map((msg: { text: string }) => `- User: ${msg.text}`)
                .join("\n");
        }

        const fullPrompt = `
      You are a writing assistant helping a user refine their rough notes for a letter.
            
      CURRENT ROUGH NOTES:
      ${roughNotes}
      ${historyContext}

      LATEST USER FEEDBACK/REQUEST:
      ${instructions}

      INSTRUCTIONS:
      1. Rewrite the "Current Rough Notes" to incorporate the "User Feedback".
      2. You can add points, remove points, or change the emphasis as requested.
      3. Do NOT write the final letter. Just output the updated raw notes/bullet points.
      4. Keep the output plain text.
    `;

        console.log("Refining with OpenRouter model:", model);
        console.log("Rough Notes:", roughNotes);

        const openai = createOpenAIClient();

        const agent = { ...AGENTS.REFINE };
        if (model) agent.primary = model;

        try {
            const response = await callWithFallback(
                openai,
                [
                    { role: "system", content: "You are a helpful AI writing assistant." },
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
            const errorMessage = err instanceof Error ? err.message : "Failed to refine content";
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
    } catch (error) {
        console.error("Refine Request Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to process request.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
