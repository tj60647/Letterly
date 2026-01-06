export const MODELS = [
    // Chat Models
    { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', type: 'chat' },
    { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', type: 'chat' },
    { id: 'openai/gpt-oss-120b:free', name: 'GPT-OSS 120B (Free)', type: 'chat' },
    { id: 'openai/gpt-oss-20b:free', name: 'GPT-OSS 20B (Free)', type: 'chat' },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Google Gemini 2.0 Flash (Free)', type: 'chat' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free)', type: 'chat' },
    { id: 'nousresearch/hermes-3-llama-3.1-405b:free', name: 'Hermes 3 405B (Free)', type: 'chat' },
    { id: 'qwen/qwen-2.5-vl-7b-instruct:free', name: 'Qwen 2.5 VL 7B (Free)', type: 'chat' },
    { id: 'meta-llama/llama-3.2-11b-vision-instruct:free', name: 'Llama 3.2 11B (Free)', type: 'chat' },
    { id: 'meta-llama/llama-3-8b-instruct:free', name: 'Llama 3 8B (Free)', type: 'chat' },
    { id: 'microsoft/phi-3-medium-128k-instruct:free', name: 'Phi-3 Medium (Free)', type: 'chat' },
    { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', type: 'chat' },

    // Embedding Models
    { id: 'openai/text-embedding-3-large', name: 'OpenAI Embedding 3 Large', type: 'embedding' },
    { id: 'openai/text-embedding-3-small', name: 'OpenAI Embedding 3 Small', type: 'embedding' },
    { id: 'mistralai/mistral-embed-2312', name: 'Mistral Embed (2312)', type: 'embedding' },
    { id: 'google/gemini-embedding-001', name: 'Google Gemini Embed', type: 'embedding' },
];

export const AGENTS = {
    GENERATE: {
        id: 'GENERATE',
        name: 'Draft Generator',
        description: 'Writes a draft letter from your rough notes, tone, language, and length settings.',
        type: 'chat',
        primary: "openai/gpt-oss-120b:free",
        fallbacks: [
            "openai/gpt-oss-120b",
        ],
        systemInstruction: `Act as an expert writer and editor. 
Produce ONLY the content of the letter. Do not include introductory text like "Here is your letter:".
Do not add additional content or make up details beyond what is provided in the key points.
Maintain the requested tone throughout.
Ensure the flow is logical and polished.
If the rough draft is fragmented, expand it into full coherent sentences.
Use standard letter formatting (salutation, body, closing).`
    },
    REFINE: {
        id: 'REFINE',
        name: 'Refinement Editor',
        description: 'Updates your rough notes based on your chat feedback. Tells the Draft Generator to make another pass.',
        type: 'chat',
        primary: "openai/gpt-oss-120b:free",
        fallbacks: [
            "openai/gpt-oss-120b",
        ],
        systemInstruction: `You are a writing assistant helping a user refine their rough notes for a letter.

INSTRUCTIONS:
1. Rewrite the "Current Rough Notes" to incorporate the "User Feedback".
2. You can add points, remove points, or change the emphasis as requested.
3. Do NOT write the final letter. Just output the updated raw notes/bullet points.
4. Keep the output plain text.`
    },
    SUGGEST: {
        id: 'SUGGEST',
        name: 'Suggestions',
        description: 'Reviews your draft letter to propose actionable improvements based on the draft letter and your rough notes.',
        type: 'chat',
        primary: "openai/gpt-oss-120b:free",
        fallbacks: ["openai/gpt-oss-120b"],
        systemInstruction: `Act as an expert editor reviewing a draft letter against the user's original rough notes.
Your goal is to identify specific improvements to make the letter more precise, effective, or aligned with the user's intent.
Focus on:
1. Ambiguities (e.g., "soon" instead of a date).
2. Missing details present in notes but missed in the draft.
3. Tone mismatches.
4. Logical gaps.

Provide 3 specific, actionable suggestions for the user to add or clarify in their notes to improve the next iteration.
Suggestions should be brief directives (e.g., "Specify the exact meeting date", "Mention the project name explicitly").
Return ONLY the suggestions as a JSON array of strings.`
    },
    RECOMMEND_LENGTH: {
        id: 'RECOMMEND_LENGTH',
        name: 'Length Analyst',
        description: 'Analyzes your rough notes to recommend the optimal draft letter length.',
        type: 'chat',
        primary: "openai/gpt-oss-20b:free",
        fallbacks: ["openai/gpt-oss-20b"],
        systemInstruction: `Analyze the following rough notes for a letter.
Based on the complexity, number of topics, and implied depth of the content, recommend the most appropriate length for the final letter.

Criteria:
- "Short": Simple requests, quick updates, single-topic messages, or very brief notes.
- "Medium": Standard correspondence, multiple points to cover, or moderate complexity.
- "Long": Detailed explanations, complex arguments, sensitive topics requiring nuance, or many distinct points.

Return ONLY one word: "Short", "Medium", or "Long". Do not use Markdown formatting.`
    },
    SYNC_NOTES: {
        id: 'SYNC_NOTES',
        name: 'Notes Sync',
        description: 'Updates your rough notes to match changes you make when editing the letter.',
        type: 'chat',
        primary: "openai/gpt-oss-120b:free",
        fallbacks: ["openai/gpt-oss-120b"],
        systemInstruction: `You are a helpful assistant that keeps rough notes in sync with a finished letter.
Compare the "Edited Letter" to the "Current Rough Notes".
Identify any NEW information, specific details, or key points that appear in the letter but are missing from the notes.

Return ONLY the new points as a bulleted list (e.g., "- New point here").
If there is no new information, return an empty string.
Do not repeat points that are already in the rough notes.
Keep the points concise.
IMPORTANT: Write all points in present tense, not past tense (e.g., "Express interest in..." not "Expressed interest in...", "Add budget details" not "Added budget details").`
    },
    SCORED: {
        id: 'SCORED',
        name: 'Similarity Scorer',
        description: 'Calculates the match score between your rough notes and the draft letter.',
        type: 'embedding',
        primary: "openai/text-embedding-3-large",
        fallbacks: [],
        systemInstruction: `Uses cosine similarity between embeddings of your rough notes and the final letter to calculate how well the letter captures your original intent. Higher scores indicate better alignment.`
    }
} as const;
