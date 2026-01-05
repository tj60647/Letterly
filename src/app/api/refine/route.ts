import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { draft, instructions, model } = body;

        const fullPrompt = `
      You are a writing assistant helping a user refine their rough notes for a letter.
            
      CURRENT ROUGH NOTES:
      ${draft}

      USER FEEDBACK/REQUEST:
      ${instructions}

      INSTRUCTIONS:
      1. Rewrite the "Current Rough Notes" to incorporate the "User Feedback".
      2. You can add points, remove points, or change the emphasis as requested.
      3. Do NOT write the final letter. Just output the updated raw notes/bullet points.
      4. Keep the output plain text.
    `;

        console.log("Refining with OpenRouter model:", model);

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                text: "[DEMO MODE: OpenRouter Key Missing]\n\nPlease configure OPENROUTER_API_KEY to use the chat refinement feature."
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
                    { role: "system", content: "You are a helpful AI writing assistant." },
                    { role: "user", content: fullPrompt }
                ],
            });

            const generatedText = completion.choices[0].message.content || "";
            return NextResponse.json({ text: generatedText });

        } catch (err: any) {
            console.error("OpenRouter Refine Error:", err);
            return NextResponse.json({ error: err.message || "Failed to refine draft." }, { status: 500 });
        }
    } catch (error: any) {
        console.error("Refine Request Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process request." }, { status: 500 });
    }
}
