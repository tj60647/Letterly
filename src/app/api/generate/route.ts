/**
 * @file src/app/api/generate/route.ts
 * @description The core generation API. Handles finding an AI model, constructing the prompt from user inputs (recipient, tone, notes), and returning the polished letter. Also handles image generation if detected.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: LLM Generation, Prompt Engineering, OpenRouter Integration, Multi-Agent Workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';
import { GoogleGenAI } from "@google/genai";

/**
 * Generates the final letter based on user inputs.
 * Orchestrates image detection, prompt construction, and LLM generation.
 * 
 * @param {NextRequest} req - The JSON request containing configuration (recipient, sender, tone, length, notes, etc.).
 * @returns {Promise<NextResponse>} JSON response with `{ text: string, usedModel: string, backgroundImage?: string }`.
 */
export async function POST(req: NextRequest) {
    console.log("POST /api/generate called");
    try {
        const body = await req.json();
        const { recipient, sender, tone, length, language, roughNotes, styleExample, model, systemInstruction } = body;

        if (!roughNotes || typeof roughNotes !== 'string') {
            return NextResponse.json({ error: "Rough notes are required" }, { status: 400 });
        }

        // Detect and generate images from rough notes
        let generatedImage: string | null = null;
        const imageRequestPattern = /^\s*-?\s*(add|create|include|put|show|make).*?(illustration|image|picture|drawing|background|art).*$/im;
        const noteLines = roughNotes.split('\n');
        let imageRequestLine = '';

        for (const line of noteLines) {
            if (imageRequestPattern.test(line)) {
                imageRequestLine = line;
                break;
            }
        }

        if (imageRequestLine) {
            try {
                const imageResponse = await fetch(`${req.nextUrl.origin}/api/detect-image`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        message: imageRequestLine,
                        model: model
                    }),
                });
                const imageData = await imageResponse.json();

                if (imageData.imageSubject) {
                    const apiKey = process.env.GOOGLE_API_KEY;
                    if (!apiKey) {
                        console.warn("--- IMAGE Generation Skipped: GOOGLE_API_KEY not configured ---");
                    } else {
                        const ai = new GoogleGenAI({ apiKey });
                        const imageAgent = AGENTS.IMAGE;
                        const promptText = `${imageAgent.systemInstruction}\n\nTask: Create a black and white line art image based on the subject below.\nSubject: ${imageData.imageSubject}`;

                        console.log("--- IMAGE Generation ---");
                        console.log("Subject:", imageData.imageSubject);
                        console.log("Model:", imageAgent.primary);

                        const response = await ai.models.generateContent({
                            model: imageAgent.primary,
                            contents: { parts: [{ text: promptText }] },
                            config: {
                                imageConfig: { aspectRatio: "1:1" }
                            },
                        });

                        if (response.candidates?.[0]?.content?.parts) {
                            for (const part of response.candidates[0].content.parts) {
                                if (part.inlineData) {
                                    generatedImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                                    console.log("--- IMAGE Generated Successfully ---");
                                    break;
                                }
                            }
                            if (!generatedImage) {
                                console.warn("--- IMAGE Generation: No inline data found in response ---");
                            }
                        } else {
                            console.warn("--- IMAGE Generation: No candidates in response ---");
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to generate image:", error);
            }
        }

        // Strip image request lines from rough notes before generating letter
        const cleanedNotes = noteLines
            .filter(line => !imageRequestPattern.test(line))
            .join('\n');

        const fullPrompt = `
      FROM: ${sender || "[Sender Name]"}
      TO: ${recipient || "[Recipient Name]"}
      TONE: ${tone}
      LENGTH: ${length}
      OUTPUT LANGUAGE: ${language || "English"}

      ROUGH NOTES / KEY POINTS:
      ${cleanedNotes}

      ${styleExample ? `STYLE REFERENCE (Mimic this writing style): ${styleExample}` : ""}
    `;

        console.log("Generating with OpenRouter model:", model);
        console.log("Tone:", tone);
        console.log("Length:", length);
        console.log("Rough Notes:", cleanedNotes);
        if (styleExample) {
            console.log("Style Reference:", styleExample);
        }
        else {
            console.log("Style Reference: None");
        }
        if (generatedImage) {
            console.log("Background Image: Generated");
        }
        else {
            console.log("Background Image: None");
        }

        const openai = createOpenAIClient();

        const agent = { ...AGENTS.GENERATE };
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

            console.log("--- GENERATE Agent Output ---");
            console.log("Content:", response.content);
            console.log("Model:", response.usedModel);
            console.log("Returning image:", generatedImage ? `Yes (${generatedImage.substring(0, 50)}...)` : "No");
            console.log("------------------------------");

            return NextResponse.json({
                text: response.content,
                usedModel: response.usedModel,
                backgroundImage: generatedImage
            });
        } catch (err: unknown) {
            console.error("OpenRouter API Error:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to generate content via OpenRouter";
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
    } catch (error: unknown) {
        console.error("Request Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to process request.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
