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

    // Image Models
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', type: 'image' },
];

export const AGENTS = {
    GENERATE: {
        id: 'GENERATE',
        name: 'Draft Generator',
        description: 'An expert writer and editor ready to help you with your letter writing. Writes a draft letter from your rough notes, tone, language, and length settings.',
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
Use standard letter formatting (salutation, body, closing).
You may use markdown for emphasis (e.g., *italics* for subtle emphasis) when appropriate, but use sparingly.
IMPORTANT: Do NOT wrap normal text in backticks or code blocks. Only use code formatting (backticks or triple backticks) if the letter content actually includes technical code or commands that need to be shown.`
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
1. AUGMENT the "Current Rough Notes" based on the "User Feedback" - do NOT completely rewrite the entire list.
2. PRESERVE all existing bullet points EXACTLY as they are unless the user EXPLICITLY requests changes to specific points.
3. Add new points at the end of the list if the user requests additional information.
4. Remove ONLY specific points if the user explicitly asks to delete something (e.g., "remove the budget point").
5. Modify ONLY specific points if the user explicitly asks to change them (e.g., "change the meeting time to 3pm").
6. If the user's request doesn't reference existing points, assume they want to ADD new information, not replace existing information.
7. Do NOT write the final letter. Just output the updated raw notes/bullet points.
8. Keep the output plain text.
9. IMPORTANT: Keep each note item succinct - use brief bullet points (5-10 words max per item), not long sentences.
10. CRITICAL: Notes must be TONE-NEUTRAL and FACTUAL. Do NOT add any tonal language, emotional words, or stylistic flourishes to the notes themselves.
11. Examples of GOOD notes: "Ask about project timeline", "Mention budget constraints", "Request meeting next week"
12. Examples of BAD notes: "Excitedly ask about the project timeline", "Politely mention budget constraints", "Warmly request a meeting"
13. The tone will be applied when generating the letter, NOT in the notes.
14. IGNORE tone change requests (e.g., "make it more formal", "be sarcastic"). Tone is handled separately - do NOT add tone instructions to the notes.`
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
Keep the points concise and succinct - aim for 5-10 words per bullet point maximum.
IMPORTANT: Write all points in present tense, not past tense (e.g., "Express interest in..." not "Expressed interest in...", "Add budget details" not "Added budget details").`
    },
    SCORED: {
        id: 'SCORED',
        name: 'Similarity Scorer',
        description: 'Calculates the match score between your rough notes and the draft letter.',
        type: 'embedding',
        primary: "openai/text-embedding-3-large",
        fallbacks: [],
        systemInstruction: `Uses cosine similarity between embeddings of your rough notes and the final letter to calculate how well the letter captures your original intent. Higher scores indicate better alignment.`,
        hidden: true
    },
    MATCH_SUGGESTIONS_SCORER: {
        id: 'MATCH_SUGGESTIONS_SCORER',
        name: 'Suggestion Matcher Scorer',
        description: 'Matches chat messages to editor review suggestions using semantic similarity.',
        type: 'embedding',
        primary: "google/gemini-embedding-001",
        fallbacks: ["openai/text-embedding-3-small", "mistralai/mistral-embed"],
        systemInstruction: `Compares the semantic similarity between a chat message and editor review suggestions to identify which suggestions the user is addressing.`,
        hidden: true
    },
    MATCH_SUGGESTIONS: {
        id: 'MATCH_SUGGESTIONS',
        name: 'Suggestion Matcher',
        description: 'Uses AI reasoning to match chat messages to editor review suggestions.',
        type: 'chat',
        primary: "openai/gpt-oss-20b",
        fallbacks: ["openai/gpt-oss-20b:free"],
        systemInstruction: `You are analyzing whether a user's chat message addresses any of the given editor review suggestions.

Compare the chat message to each suggestion and determine which suggestions (if any) the user is trying to address.
For each match, provide a closeness score where 0.00 means very close match and 1.00 means not close at all.
Return ONLY a JSON array of objects with index and score properties.

Example:
Chat: "make it more formal"
Suggestions: ["Consider a more formal tone", "Add specific dates", "Clarify the budget"]
Output: [{"index": 0, "score": 0.05}, {"index": 1, "score": 0.92}]

Only include suggestions that have some relevance (score < 0.70). If no suggestions match, return an empty array: []`
    },
    DETECT_TONE_REQUEST: {
        id: 'DETECT_TONE_REQUEST',
        name: 'Tone Request Detector',
        description: 'Analyzes chat messages to detect tone change requests and maps them to existing or new tones.',
        type: 'chat',
        primary: "openai/gpt-oss-20b:free",
        fallbacks: ["openai/gpt-oss-20b"],
        systemInstruction: `You analyze user messages to detect tone change requests for letters.

You will receive:
1. The user's message
2. A list of existing available tones

Your task:
- Determine if the user is requesting a tone change
- If yes, check if the requested tone matches any existing tone (consider synonyms and similar meanings)
- If it matches an existing tone, return that exact tone name
- If it's a new tone not covered by existing options, return a clean, title-cased name for the new tone
- If no tone change is requested, return an empty string

Return ONLY the tone name. No explanation, no formatting, no punctuation.
Examples:
- If user says "make it formal" and "Professional" exists → return "Professional"
- If user says "be sarcastic" and no similar tone exists → return "Sarcastic"
- If user says "add more details" → return "" (empty, not a tone request)`,
        hidden: true
    },
    DETECT_IMAGE_REQUEST: {
        id: 'DETECT_IMAGE_REQUEST',
        name: 'Image Request Detector',
        description: 'Analyzes chat messages to detect requests for background images or illustrations.',
        type: 'chat',
        primary: "openai/gpt-oss-20b:free",
        fallbacks: ["openai/gpt-oss-20b"],
        systemInstruction: `You analyze user messages to detect requests for background images or illustrations.

Your task:
- Determine if the user is requesting an image, illustration, drawing, or background
- If yes, extract a clear, concise subject description for the image (e.g., "a rose", "mountain landscape", "compass")
- If no image is requested, return an empty string

Return ONLY the subject description. No explanation, no formatting, just the subject.
Examples:
- "add a rose image" → return "a rose"
- "create a mountain background" → return "mountain landscape"
- "put an illustration of a compass" → return "a compass"
- "make it more formal" → return "" (empty, not an image request)
- "add more details about the timeline" → return "" (empty, not an image request)`,
        hidden: true
    },
    IMAGE: {
        id: 'IMAGE',
        name: 'Line Art Generator',
        description: 'Creates intricate black and white line art illustrations as watermarks for letters.',
        type: 'image',
        primary: "gemini-2.5-flash-image",
        fallbacks: [],
        systemInstruction: `Create an intricate black and white ink illustration.
Requirements:
- Pure white background
- Use varying line weights for depth
- Incorporate cross-hatching and stippling for texture
- Highly detailed contours
- Professional botanical or technical drawing style
- No gray tones or digital gradients, only black ink techniques`,
        hidden: false
    }
} as const;
