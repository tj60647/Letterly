# Letterly

Letterly is an intelligent writing companion designed to transform messy thoughts into polished, professional letters. It leverages advanced AI models to help users craft meaningful messages with the perfect tone and structure.

## Product Features

-   **Rough Notes to Polished Text**: Simply jot down bullet points or fragmented thoughts, and Letterly expands them into a coherent, well-structured letter.
-   **Writers' Room**: A dedicated team of specialized AI agents working together on your document. Configure each agent individually to use the best model for the job.
-   **Specialized Agents**:
    -   **Draft Generator**: Writes a draft letter from your rough notes, tone, language, and length settings.
    -   **Refinement Editor**: Updates your rough notes based on your chat feedback. Tells the Draft Generator to make another pass.
    -   **Suggestions Agent**: Reviews your draft to propose actionable improvements based on the draft and your rough notes.
    -   **Length Analyst**: Analyzes your notes to recommend the optimal letter length.
    -   **Notes Sync**: Updates your rough notes to match changes you make when editing the letter.
    -   **Similarity Scorer**: Calculates the match score between your notes and the draft.
-   **Customizable Tone & Length**: Adjust the voice of your letter (Professional, Casual, Firm, etc.) and the desired length with a single click.
-   **Style Matching**: Paste an example of your writing, and the AI will mimic your unique style and voice.
-   **Iterative Refinement**: Use the built-in chat interface to converse with the AI.
-   **Version History**: Automatically saves versions of your letter.

## Architecture

Letterly follows a clear client-server architecture implemented within the Next.js framework.

### 1. The UI (Client)
The frontend is a React-based interface that runs in the user's browser.
-   **Core Component**: `LetterApp.tsx` acts as the main controller.
-   **Writers' Room**: `AgentModelSettings.tsx` manages the team configuration, allowing users to assign specific models to specific agents.
-   **Responsibilities**: 
    -   Captures user input (metadata, rough notes, chat commands).
    -   Manages application state (current draft, letter history, loading states, agent assignments).
    -   Renders the interactive UI.

### 2. The API (Server)
The backend consists of agent-specific API routes. Each route corresponds to a role in the Writers' Room.
-   **Endpoints**: 
    -   `POST /api/generate`: (Draft Generator) Creates the letter content.
    -   `POST /api/refine`: (Refinement Editor) Updates notes based on chat.
    -   `POST /api/suggest`: (Suggestions) providing critical feedback.
    -   `POST /api/recommend-length`: (Length Analyst) Advises on structure.
    -   `POST /api/sync-notes`: (Notes Sync) Keeps notes aligned with manual edits.
    -   `POST /api/score`: (Similarity Scorer) Embeddings-based comparison.
-   **AI Integration**:
    -   **OpenAI SDK**: Configured to work with **OpenRouter**, providing a unified interface to access various LLMs (including Google's Gemini, Meta's Llama, etc.) using a single API key.
    -   **Agent Architecture**: Centralized in `src/lib/models.ts` and `src/lib/agent-constants.ts`.

### Data Flow
1.  **Input**: User provides metadata (Sender, Recipient), configuration (Tone, Length), and Rough Notes in the **UI**.
2.  **Request**: The UI sends this data to the **API** (`/api/generate`).
3.  **AI Processing**: The API constructs a prompt and queries the selected LLM.
4.  **Response**: The API returns the generated text to the UI for display.
5.  **Refinement**: If the user chats with the AI, the UI sends the request to `/api/refine`, which updates the notes and triggers a new generation cycle.

## API Reference

Since Letterly's backend is decoupled from the UI, other applications can consume its API directly to generate and refine content.

### 1. Generate Letter
**Endpoint:** `POST /api/generate`

Generates a polished letter based on rough notes and configuration.

**Request Body:**
```json
{
  "sender": "Alice",
  "recipient": "Bob",
  "tone": "Professional",
  "length": "Medium",
  "draft": "- Discuss the Q3 report\n- Mention the budget increase",
  "styleExample": "Optional text to mimic...",
  "model": "google/gemini-2.0-flash-exp:free"
}
```

**Response:**
```json
{
  "text": "Dear Bob,\n\nI am writing to discuss the Q3 report..."
}
```

### 2. Refine Draft
**Endpoint:** `POST /api/refine`

Updates rough notes based on natural language instructions (e.g., "Make it friendlier").

**Request Body:**
```json
{
  "draft": "- Discuss the Q3 report",
  "instructions": "Add a point about the team lunch",
  "model": "google/gemini-2.0-flash-exp:free"
}
```

**Response:**
```json
{
  "text": "- Discuss the Q3 report\n- Mention the upcoming team lunch"
}
```

## Getting Started

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    -   Create a `.env.local` file.
    -   Add your API keys:
        ```env
        GOOGLE_API_KEY=your_google_key
        OPENROUTER_API_KEY=your_openrouter_key
        ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000).

