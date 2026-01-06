import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

const SYSTEM_INSTRUCTION = `
Analyze the following rough notes for a letter.
Based on the complexity, number of topics, and implied depth of the content, recommend the most appropriate length for the final letter.

Criteria:
- "Short": Simple requests, quick updates, single-topic messages, or very brief notes.
- "Medium": Standard correspondence, multiple points to cover, or moderate complexity.
- "Long": Detailed explanations, complex arguments, sensitive topics requiring nuance, or many distinct points.

Return ONLY one word: "Short", "Medium", or "Long". Do not use Markdown formatting (no bold, no italics, no backticks).
`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roughNotes } = body;

        if (!roughNotes || roughNotes.trim().length < 10) {
            return NextResponse.json({ recommendation: "Short" });
        }

        const openai = createOpenAIClient();

        const response = await callWithFallback(
            openai,
            [
                { role: "system", content: SYSTEM_INSTRUCTION },
                { role: "user", content: `Rough Notes:\n${roughNotes}` }
            ],
            AGENTS.RECOMMEND_LENGTH
        );

        const recommendation = response.content.trim() || "Medium";
        
        // Validate output
        const validLengths = ["Short", "Medium", "Long"];
        const finalRec = validLengths.find(l => recommendation.includes(l)) || "Medium";

        return NextResponse.json({ recommendation: finalRec });

    } catch (error: unknown) {
        console.error("Error recommending length:", error);
        return NextResponse.json({ error: "Failed to recommend length" }, { status: 500 });
    }
}
