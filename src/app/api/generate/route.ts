import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

// Initialize clients (ensure API keys are present in environment variables)
// For this demo/refactor, we handle missing keys gracefully by returning mock data or errors.

const SYSTEM_INSTRUCTION = `
Act as an expert writer and editor. 
Produce ONLY the content of the letter. Do not include introductory text like "Here is your letter:".
Maintain the requested tone throughout.
Ensure the flow is logical and polished.
If the rough draft is fragmented, expand it into full coherent sentences.
Use standard letter formatting (salutation, body, closing).
`;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { recipient, sender, tone, length, draft, model } = body;

        const fullPrompt = `
      FROM: ${sender || "[Sender Name]"}
      TO: ${recipient || "[Recipient Name]"}
      TONE: ${tone}
      LENGTH: ${length}

      ROUGH DRAFT / KEY POINTS:
      ${draft}
    `;

        console.log("Generating with OpenRouter model:", model);

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            // Fallback/Demo response if key is missing
            return NextResponse.json({
                text: "[DEMO MODE: OpenRouter Key Missing]\n\nPlease configure OPENROUTER_API_KEY in your .env file to generate real content."
            });
        }

        const openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: apiKey,
            defaultHeaders: {
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Letterly",
            }
        });

        try {
            const completion = await openai.chat.completions.create({
                model: model || "google/gemini-2.0-flash-exp:free",
                messages: [
                    { role: "system", content: SYSTEM_INSTRUCTION },
                    { role: "user", content: fullPrompt }
                ],
            });

            const generatedText = completion.choices[0].message.content || "";
            return NextResponse.json({ text: generatedText });

        } catch (err: any) {
            console.error("OpenRouter API Error:", err);
            return NextResponse.json({ error: err.message || "Failed to generate content via OpenRouter" }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Request Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
    }
}
