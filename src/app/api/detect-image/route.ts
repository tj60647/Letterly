/**
 * @file src/app/api/detect-image/route.ts
 * @description API route that uses an AI agent to determine if the user's rough notes contain a request for an image or illustration.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: AI Classification, Helper Agents, Image Detection
 */

import { NextRequest, NextResponse } from "next/server";
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

/**
 * Detects if the user's message contains a request for an image or illustration.
 * 
 * @param {NextRequest} req - The JSON request containing `{ message: string, model?: string }`.
 * @returns {Promise<NextResponse>} JSON response with `{ imageSubject: string | null, usedModel: string }`.
 */
export async function POST(req: NextRequest) {
    try {
        const { message, model, systemInstruction } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const openai = createOpenAIClient();

        const agent = { ...AGENTS.DETECT_IMAGE_REQUEST };
        if (model) agent.primary = model;
        if (systemInstruction) agent.systemInstruction = systemInstruction; // Override default

        const response = await callWithFallback(
            openai,
            [
                { role: "system", content: agent.systemInstruction },
                { role: "user", content: message }
            ],
            agent
        );

        const imageSubject = response.content.trim();

        console.log("--- DETECT_IMAGE_REQUEST Agent Output ---");
        console.log("Message:", message);
        console.log("Image Subject:", imageSubject || "None detected");
        console.log("Model:", response.usedModel);
        console.log("------------------------------------------");

        return NextResponse.json({
            imageSubject: imageSubject || null,
            usedModel: response.usedModel
        });

    } catch (error: unknown) {
        console.error("Detect Image Request Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to detect image request";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
