/**
 * @file src/app/api/suggest/route.ts
 * @description Acts as an "Editor Agent" to suggest improvements to the user's notes before generation, helping clarity and completeness.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Agentic Critiques, JSON Output, Proactive Assistance
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

/**
 * Analyzes the current draft and notes to suggest 3 actionable improvements.
 * 
 * @param {NextRequest} req - The JSON request containing `{ roughNotes, context, recipient, generatedLetter, tone, length, model }`.
 * @returns {Promise<NextResponse>} JSON response with `{ suggestions: string[], usedModel: string }`.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roughNotes, context, recipient, generatedLetter, tone, length, model, styleExample, systemInstruction } = body;

        if (!roughNotes || roughNotes.trim().length < 5) {
            return NextResponse.json({ error: "Rough notes are required" }, { status: 400 });
        }

        const openai = createOpenAIClient();

        const prompt = `
        Context: ${context || "General Letter"}
        Recipient: ${recipient || "Unknown"}
        Requested Tone: ${tone || "Not specified"}
        Requested Length: ${length || "Not specified"}
        
        Rough Notes:
        ${roughNotes}

        ${styleExample ? `Style Context/Match: ${styleExample}` : ""}

        Generated Draft:
        ${generatedLetter || "(No draft generated yet)"}
        `;

        const agent = { ...AGENTS.SUGGEST };
        if (model) agent.primary = model;
        if (systemInstruction) agent.systemInstruction = systemInstruction; // Override default

        const response = await callWithFallback(
            openai,
            [
                { role: "system", content: agent.systemInstruction },
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

        if (!content || !content.trim()) {
            console.warn("Suggest agent returned empty content.");
            return NextResponse.json({ suggestions: [], usedModel: response.usedModel });
        }

        try {
            // Some models might include markdown code blocks ```json ... ```
            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

            console.log("--- Suggestions Response ---");
            console.log("Raw content:", content);
            console.log("Clean content:", cleanContent);

            const parsed = JSON.parse(cleanContent);

            if (Array.isArray(parsed.suggestions)) {
                suggestions = parsed.suggestions;
            } else if (Array.isArray(parsed.final)) {
                suggestions = parsed.final;
            }

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
                    const fixedJson = arrayMatch[0]
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
