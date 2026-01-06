import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, AGENTS } from '@/lib/models';

function cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roughNotes, letter, model } = body;

        if (!roughNotes || !letter) {
            return NextResponse.json({ score: 0 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            // Mock score if no key
            return NextResponse.json({ score: 0.85 });
        }

        const openai = createOpenAIClient();

        // Log the text used for embeddings
        console.log("--- Embedding Input A (Rough Notes) ---");
        console.log(roughNotes);
        console.log("--- Embedding Input B (Letter) ---");
        console.log(letter);
        console.log("----------------------------------");

        // Generate embeddings for both inputs and letter
        const response = await openai.embeddings.create({
            model: model || AGENTS.SCORED.primary,
            input: [roughNotes, letter],
        });

        const embeddingA = response.data[0].embedding;
        const embeddingB = response.data[1].embedding;

        const similarity = cosineSimilarity(embeddingA, embeddingB);
        
        // Normalize or adjust if needed, but raw cosine similarity (-1 to 1) is requested.
        // Usually for text embeddings it's 0 to 1.
        
        return NextResponse.json({ score: similarity });

    } catch (error) {
        console.error("Error calculating score:", error);
        return NextResponse.json({ error: "Failed to calculate score" }, { status: 500 });
    }
}
