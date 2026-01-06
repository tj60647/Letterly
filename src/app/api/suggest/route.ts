import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

const SYSTEM_INSTRUCTION = `
Act as an expert editor reviewing a draft letter against the user's original rough notes.
Your goal is to identify specific improvements to make the letter more precise, effective, or aligned with the user's intent.
Focus on:
1. Ambiguities (e.g., "soon" instead of a date).
2. Missing details present in notes but missed in the draft.
3. Tone mismatches (does the draft match the requested tone?).
4. Length appropriateness (does the draft match the requested length?).
5. Logical gaps.

Provide no more than 3 specific, actionable suggestions for the user to add or clarify in their notes to improve the next iteration.
Suggestions should be brief directives (e.g., "Specify the exact meeting date", "Mention the project name explicitly", "Adjust tone to be more formal").
Return ONLY the suggestions as a JSON array of strings. Example: ["Clarify the deadline", "Add the budget figure"]
`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roughNotes, context, recipient, generatedLetter, tone, length, model } = body;

        if (!roughNotes || roughNotes.trim().length < 5) {
            return NextResponse.json({ suggestions: [] });
        }

        const openai = createOpenAIClient();

        const prompt = `
        Context: ${context || "General Letter"}
        Recipient: ${recipient || "Unknown"}
        Requested Tone: ${tone || "Not specified"}
        Requested Length: ${length || "Not specified"}
        
        Rough Notes:
        ${roughNotes}

        Generated Draft:
        ${generatedLetter || "(No draft generated yet)"}
        `;

        const agent = { ...AGENTS.SUGGEST };
        if (model) agent.primary = model;

        const response = await callWithFallback(
            openai, 
            [
                { role: "system", content: SYSTEM_INSTRUCTION },
                { role: "user", content: prompt }
            ],
            agent,
            { type: "json_object" }
        );

        const content = response.content;
        
        console.log("--- SUGGEST Agent Output ---");
        console.log("Raw Content:", content);
        console.log("Model:", response.usedModel);
        
        let suggestions = [];
        try {
            // Some models might include markdown code blocks ```json ... ```
            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
            
            console.log("--- Suggestions Response ---");
            console.log("Raw content:", content);
            console.log("Clean content:", cleanContent);
            
            const parsed = JSON.parse(cleanContent);
            suggestions = parsed.suggestions || [];
            
            // If parsed is an array directly
            if (Array.isArray(parsed)) suggestions = parsed;
            
        } catch (e) {
            console.error("Failed to parse suggestions JSON", e);
            console.error("Content was:", content);
            
            // Try to extract suggestions from malformed JSON
            // Look for array-like content [...]
            const arrayMatch = content.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                try {
                    // Try to fix common JSON issues
                    let fixedJson = arrayMatch[0]
                        .replace(/'/g, '"')  // Replace single quotes with double quotes
                        .replace(/,\s*]/g, ']')  // Remove trailing commas
                        .replace(/,\s*}/g, '}'); // Remove trailing commas in objects
                    const parsed = JSON.parse(fixedJson);
                    if (Array.isArray(parsed)) {
                        suggestions = parsed;
                        console.log("Fixed and parsed suggestions:", suggestions);
                    }
                } catch (fixError) {
                    console.error("Could not fix JSON:", fixError);
                    // Fallback: extract bullet points
                    suggestions = content.split('\n')
                        .filter(line => line.trim().startsWith('-'))
                        .map(line => line.replace(/^-\s*/, '').trim())
                        .filter(s => s.length > 0);
                }
            } else {
                // Fallback: extract bullet points
                suggestions = content.split('\n')
                    .filter(line => line.trim().startsWith('-'))
                    .map(line => line.replace(/^-\s*/, '').trim())
                    .filter(s => s.length > 0);
            }
        }

        return NextResponse.json({ 
            suggestions,
            usedModel: response.usedModel 
        });

    } catch (error) {
        console.error("Error generating suggestions:", error);
        return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
    }
}
