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

        const systemPrompt = `
        You are a helpful assistant that keeps rough notes in sync with a finished letter.
        Compare the "Edited Letter" to the "Current Rough Notes".
        Identify any NEW information, specific details, or key points that appear in the letter but are missing from the notes.
        
        Return ONLY the new points as a bulleted list (e.g., "- New point here").
        If there is no new information, return an empty string.
        Do not repeat points that are already in the rough notes.
        Keep the points concise.
        IMPORTANT: Write all points in present tense, not past tense (e.g., "Express interest in..." not "Expressed interest in...", "Add budget details" not "Added budget details").
        `;

        const agent = { ...AGENTS.SYNC_NOTES };
        if (model) agent.primary = model;

        const response = await callWithFallback(
            openai,
            [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Current Rough Notes:\n${roughNotes}\n\nEdited Letter:\n${editedLetter}` }
            ],
            agent
        );

        const content = response.content.trim();
        
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
