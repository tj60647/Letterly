import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { editedLetter, roughNotes, model } = body;

        if (!editedLetter || !roughNotes) {
            return NextResponse.json({ newPoints: "" });
        }

        const openai = createOpenAIClient();

        const agent = { ...AGENTS.SYNC_NOTES };
        if (model) agent.primary = model;

        const response = await callWithFallback(
            openai,
            [
                { role: "system", content: agent.systemInstruction },
                { role: "user", content: `Current Rough Notes:\n${roughNotes}\n\nEdited Letter:\n${editedLetter}` }
            ],
            agent
        );

        const content = response.content.trim();
        
        console.log("--- SYNC_NOTES Agent Output ---");
        console.log("Content:", content);
        console.log("Model:", response.usedModel);
        console.log("-------------------------------");
        
        // Parse bullets
        const lines = content.split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('- ') || line.startsWith('* '));
        
        // Clean bullets
        const cleanPoints = lines.map(line => line.replace(/^[-*]\s+/, ''));

        return NextResponse.json({ 
            newPoints: cleanPoints 
        });

    } catch (error: unknown) {
        console.error("Error syncing notes:", error);
        return NextResponse.json({ error: "Failed to sync notes" }, { status: 500 });
    }
}
