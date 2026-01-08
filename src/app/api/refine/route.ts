/**
 * @file src/app/api/refine/route.ts
 * @description Handles iterative improvements to the draft. Takes user feedback and modifies the generated text while preserving context.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Iterative Generation, Context Management, Feedback Loops
 */

import { NextRequest, NextResponse } from "next/server";
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

/**
 * Iteratively refines the rough notes based on user chat instructions.
 * Can also detect implicit tone changes within the chat message.
 * 
 * @param {NextRequest} req - The JSON request containing `{ roughNotes, instructions, conversationHistory, model, existingTones }`.
 * @returns {Promise<NextResponse>} JSON response with `{ text: string, usedModel: string, detectedTone?: string }`.
 */
export async function POST(req: NextRequest) {
    console.log("POST /api/refine called");
    try {
        const body = await req.json();
        const { roughNotes, instructions, conversationHistory, model, currentTone, existingTones, systemInstruction } = body;

        // Detect tone change requests using agent
        let detectedTone: string | null = null;
        try {
            const toneResponse = await fetch(`${req.nextUrl.origin}/api/detect-tone`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: instructions,
                    existingTones: existingTones || [],
                    model: model // Use same model as refine for consistency
                }),
            });
            const toneData = await toneResponse.json();
            if (toneData.tone) {
                detectedTone = toneData.tone;
            }
        } catch (error) {
            console.error("Failed to detect tone:", error);
        }

        // Format conversation history if available
        let historyContext = "";
        if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
            historyContext = "\n\nPREVIOUS CONVERSATION:\n" + conversationHistory
                .filter((msg: { role: string }) => msg.role === 'user') // Only include user requests to avoid noise
                .map((msg: { text: string }) => `- User: ${msg.text}`)
                .join("\n");
        }

        const fullPrompt = `
CURRENT ROUGH NOTES:
${roughNotes}
${historyContext}

LATEST USER FEEDBACK/REQUEST:
${instructions}
    `;

        console.log("Refining with OpenRouter model:", model);
        console.log("Rough Notes:", roughNotes);

        const openai = createOpenAIClient();

        const agent = { ...AGENTS.REFINE };
        if (model) agent.primary = model;
        if (systemInstruction) agent.systemInstruction = systemInstruction; // Override default

        try {
            const response = await callWithFallback(
                openai,
                [
                    { role: "system", content: agent.systemInstruction },
                    { role: "user", content: fullPrompt }
                ],
                agent
            );

            console.log("--- REFINE Agent Output ---");
            console.log("Content:", response.content);
            console.log("Detected Tone:", detectedTone || "None");
            console.log("Model:", response.usedModel);
            console.log("---------------------------");

            return NextResponse.json({
                text: response.content,
                usedModel: response.usedModel,
                detectedTone: detectedTone
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
