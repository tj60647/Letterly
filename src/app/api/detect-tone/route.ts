import { NextRequest, NextResponse } from "next/server";
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, existingTones, model } = body;

        if (!message) {
            return NextResponse.json({ tone: null, isNewTone: false });
        }

        const openai = createOpenAIClient();
        const agent = { ...AGENTS.DETECT_TONE_REQUEST };
        if (model) agent.primary = model;

        const tonesList = existingTones && existingTones.length > 0 
            ? existingTones.join(", ")
            : "Professional, Casual, Persuasive, Apologetic, Warm & Friendly, Firm & Direct, Grateful";

        const prompt = `User message: "${message}"

Existing available tones: ${tonesList}

Is the user requesting a tone change? If yes, return the matching existing tone or a new tone name. If no, return empty string.`;

        const response = await callWithFallback(
            openai,
            [
                { role: "system", content: agent.systemInstruction },
                { role: "user", content: prompt }
            ],
            agent
        );

        const detectedTone = response.content.trim();
        
        console.log("--- DETECT_TONE_REQUEST Agent Output ---");
        console.log("Content:", detectedTone || "(empty)");
        console.log("Model:", response.usedModel);
        console.log("-----------------------------------------");
        
        if (!detectedTone) {
            return NextResponse.json({ 
                tone: null, 
                isNewTone: false,
                usedModel: response.usedModel 
            });
        }

        // Check if this is a new tone or existing
        const isNewTone = existingTones ? !existingTones.includes(detectedTone) : true;
        
        return NextResponse.json({ 
            tone: detectedTone,
            isNewTone: isNewTone,
            usedModel: response.usedModel 
        });

    } catch (error) {
        console.error("Tone detection error:", error);
        return NextResponse.json({ tone: null, isNewTone: false }, { status: 500 });
    }
}
