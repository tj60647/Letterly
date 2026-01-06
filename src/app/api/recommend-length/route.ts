import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

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
                { role: "system", content: AGENTS.RECOMMEND_LENGTH.systemInstruction },
                { role: "user", content: `Rough Notes:\n${roughNotes}` }
            ],
            AGENTS.RECOMMEND_LENGTH
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
