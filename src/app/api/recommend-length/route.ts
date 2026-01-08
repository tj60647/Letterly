/**
 * @file src/app/api/recommend-length/route.ts
 * @description Analyzes the user's rough notes to recommend an appropriate length for the generated letter (Short, Medium, or Long).
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: AI Heuristics, User Intent Analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

/**
 * Recommends an optimal letter length (Short, Medium, Long) based on the quantity and depth of rough notes.
 * 
 * @param {NextRequest} req - The JSON request containing `{ roughNotes: string }`.
 * @returns {Promise<NextResponse>} JSON response with `{ recommendation: "Short" | "Medium" | "Long" }`.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roughNotes, systemInstruction } = body;

        if (!roughNotes || roughNotes.trim().length < 10) {
            return NextResponse.json({ recommendation: "Short" });
        }

        const openai = createOpenAIClient();

        const agent = { ...AGENTS.RECOMMEND_LENGTH };
        if (systemInstruction) agent.systemInstruction = systemInstruction; // Override default

        const response = await callWithFallback(
            openai,
            [
                { role: "system", content: agent.systemInstruction },
                { role: "user", content: `Rough Notes:\n${roughNotes}` }
            ],
            agent
        );

        const recommendation = response.content.trim() || "Medium";

        console.log("--- RECOMMEND_LENGTH Agent Output ---");
        console.log("Content:", recommendation);
        console.log("Model:", response.usedModel);
        console.log("-------------------------------------");

        // Validate output
        const validLengths = ["Short", "Medium", "Long"];
        const finalRec = validLengths.find(l => recommendation.includes(l)) || "Medium";

        return NextResponse.json({ recommendation: finalRec });

    } catch (error: unknown) {
        console.error("Error recommending length:", error);
        return NextResponse.json({ error: "Failed to recommend length" }, { status: 500 });
    }
}
