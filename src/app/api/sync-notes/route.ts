/**
 * @file src/app/api/sync-notes/route.ts
 * @description Reverse-syncs changes made in the letter editor back to the rough notes, keeping the source of truth updated.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Data Synchronization, Reverse Generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, callWithFallback, AGENTS } from '@/lib/models';

/**
 * Identifies new information added directly to the letter editor and syncs it back to the rough notes.
 * 
 * @param {NextRequest} req - The JSON request containing `{ editedLetter: string, roughNotes: string, model?: string }`.
 * @returns {Promise<NextResponse>} JSON response with `{ newPoints: string[] }`.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { editedLetter, roughNotes, model, systemInstruction } = body;

        if (!editedLetter || !roughNotes) {
            return NextResponse.json({ newPoints: "" });
        }

        const openai = createOpenAIClient();

        const agent = { ...AGENTS.SYNC_NOTES };
        if (model) agent.primary = model;
        if (systemInstruction) agent.systemInstruction = systemInstruction; // Override default

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
