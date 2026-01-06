import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { chatInput, suggestions, model } = body;

        if (!chatInput || !suggestions || suggestions.length === 0) {
            return NextResponse.json({ matchedSuggestions: [] });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            // Return empty matches if no API key
            return NextResponse.json({ matchedSuggestions: [] });
        }

        const systemPrompt = AGENTS.MATCH_SUGGESTIONS.systemInstruction;
        
        const userPrompt = `Chat Message: "${chatInput}"

Suggestions:
${suggestions.map((s: string, i: number) => `${i}. ${s}`).join('\n')}

Return a JSON array of matched indices.`;

        console.log("--- Match Suggestions Agent ---");
        console.log("Chat Input:", chatInput);
        console.log("Suggestions:", suggestions);

        const openai = createOpenAIClient();

        const agent = { ...AGENTS.MATCH_SUGGESTIONS };
        if (model) agent.primary = model;

        const result = await callWithFallback(
            openai,
            [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            agent
        );

        console.log("Agent Response:", result.content);
        console.log("Model:", result.usedModel);
        console.log("----------------------------------");

        // Parse the JSON response
        let matchedSuggestions: { index: number; score: number }[] = [];
        try {
            // Extract JSON array from response
            const jsonMatch = result.content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                matchedSuggestions = JSON.parse(jsonMatch[0]);
            }
        } catch (parseError) {
            console.error("Failed to parse agent response:", parseError);
        }

        console.log("Matched Suggestions:", matchedSuggestions);
        console.log("----------------------------------");

        return NextResponse.json({ matchedSuggestions, usedModel: result.usedModel });

    } catch (error) {
        console.error("Error matching suggestions with agent:", error);
        return NextResponse.json({ error: "Failed to match suggestions" }, { status: 500 });
    }
}
