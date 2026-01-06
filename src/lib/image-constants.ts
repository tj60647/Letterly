/**
 * @file src/lib/image-constants.ts
 * @description Stores constant prompts and types specifically for image generation features.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Image Generation, Prompt Templates
 */

/**
 * The system instruction used for the Image Generator agent.
 * Specifies the visual style (black and white line art) and constraints (no text).
 */
export const IMAGE_SYSTEM_INSTRUCTION = `Create an intricate black and white ink illustration.
Requirements:
- Pure white background
- Use varying line weights for depth
- Incorporate cross-hatching and stippling for texture
- Highly detailed contours
- Professional botanical or technical drawing style
- No gray tones or digital gradients, only black ink techniques
- No text, captions, or labels in the image`;

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
