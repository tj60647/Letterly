/**
 * @file src/app/api/match-suggestions/route.ts
 * @description Matches user input against a list of pre-defined suggestions using vector embeddings and cosine similarity.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Vector Embeddings, Cosine Similarity, Semantic Search
 */

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

/**
 * Finds the most relevant suggestions for a given user chat message using vector similarity.
 * 
 * @param {NextRequest} req - The JSON request containing `{ chatInput: string, suggestions: string[], model?: string }`.
 * @returns {Promise<NextResponse>} JSON response with `{ matchedIndices: number[] }` (indices of suggestions that overlap with the input).
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { chatInput, suggestions, model } = body;

        if (!chatInput || !suggestions || suggestions.length === 0) {
            return NextResponse.json({ matchedIndices: [] });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            // Return empty matches if no API key
            return NextResponse.json({ matchedIndices: [] });
        }

        const openai = createOpenAIClient();

        // Generate embeddings for chat input and all suggestions
        const textsToEmbed = [chatInput, ...suggestions];

        const response = await openai.embeddings.create({
            model: model || AGENTS.MATCH_SUGGESTIONS_SCORER.primary,
            input: textsToEmbed,
        });

        const chatEmbedding = response.data[0].embedding;
        const suggestionEmbeddings = response.data.slice(1).map(d => d.embedding);

        // Calculate similarity between chat input and each suggestion
        const matchedIndices: number[] = [];
        const SIMILARITY_THRESHOLD = 0.65;

        console.log("--- Match Suggestions Scores ---");
        console.log("Chat Input:", chatInput);

        suggestionEmbeddings.forEach((suggestionEmbedding, index) => {
            const similarity = cosineSimilarity(chatEmbedding, suggestionEmbedding);
            console.log(`Suggestion ${index}: "${suggestions[index]}" → Score: ${similarity.toFixed(4)} ${similarity >= SIMILARITY_THRESHOLD ? '✓ MATCHED' : ''}`);
            if (similarity >= SIMILARITY_THRESHOLD) {
                matchedIndices.push(index);
            }
        });

        console.log(`Matched Indices: [${matchedIndices.join(', ')}]`);
        console.log("----------------------------------");

        return NextResponse.json({ matchedIndices });

    } catch (error) {
        console.error("Error matching suggestions:", error);
        return NextResponse.json({ error: "Failed to match suggestions" }, { status: 500 });
    }
}
