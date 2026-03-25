# Letterly: Prototyping agentic systems

> [!NOTE]
> **Author Roadmap:**
> - [ ] Create separate video tutorials for Git and Node.js installation.
> - [ ] Create guide for getting OpenRouter and Google API keys.
> - [ ] Add more "Style Match" examples for testing.

**Welcome, Students!** 👋

This repository documents a full design trajectory — from embodied, hands-on prototyping to a working AI application. You will move through three stages:

1. **Bodystorming** — Physically enact the system to discover where judgment is required, where boundaries are unclear, and where authority must be defined.
2. **Role Decomposition** — Break a single overloaded role into a structured set of collaborating agents. Define their names, purposes, rules, inputs, and outputs.
3. **Building with AI Studio** — Use a coding assistant to translate your role cards and relationship diagrams directly into a running agentic application.

Letterly is what emerged from that process. It is a **letter writing assistant** built as a multi-agent system. You give it messy, unorganized thoughts (rough notes), and a team of specialized agents collaborates to produce a polished letter.

This README is organized to follow that trajectory. Start at the top and work your way through.

---

## Part 1 — Bodystorming Workshop: Letter Writing

> Before opening any code, you enacted the system. The slides below document the full workshop sequence.

Bodystorming is a viable technique for prototyping agentic systems and for designing behavior. It makes behavioral assumptions observable in action.

When roles are enacted under real-time conditions — using incomplete information, shifting constraints, and competing responsibilities — participants experience:

- where judgment is required
- where boundaries are unclear
- where authority must be defined

Rather than scripting responses, designers witness how behavior emerges from role definition, inputs, and context. This allows them to articulate not just what a system should produce, but **how it should operate** — how it asks, escalates, refuses, coordinates, and adapts.

In this way, bodystorming becomes a method for discovering and shaping behavioral structure **before implementation**.

---

### Slide 1 — Design Artifacts

The artifacts generated through bodystorming in the following workshop correspond directly to the primary design surfaces of agentic systems:

- purpose
- inputs
- knowledge
- behavioral rules
- outputs
- boundaries

These artifacts can be translated into:

- system instructions
- knowledge sources
- interaction contracts

Forming a structured foundation for building an agentic application.

---

### Slide 2 — Enact the System

You have been given:

- A Goal Card
- A sheet of Rough User Notes (3–4 incomplete fragments)
- A single role: "Letter Writing Assistant"

**Enact the role. See what happens.**

**Team Structure (4 people)**

| Role | Responsibilities |
|---|---|
| 1 User | Answer questions honestly. Do not volunteer information. Do not organize thoughts for the assistant. Do not diagnose assistant needs. |
| 1 Letter Writing Assistant | Enact the role. |
| Observer 1 (Interaction Lens) | What had to happen for progress? |
| Observer 2 (System Lens) | What would this role need to function reliably? |

**Observer Guidelines**
- Use Post-its
- Write in fragments
- Avoid interpretation
- Avoid advising mid-session

**Time limit: 10 minutes**

---

### Slide 3 — Enact the System (Stage 2)

Same as Slide 2, plus:

> At minute 5: The User reveals one additional note.

---

### Slide 4 — Enact the System (Stage 3)

Same as Slide 3, plus:

> At minute 8: The User introduces a new constraint.

---

### Slide 5 — Reflection & Debrief

**First: Individual teams process (3 min)**

Questions:

- What did the assistant do?
- What did it need?
- What did it assume?
- What did it produce?
- Where did it struggle?
- Where did responsibility blur?
- What felt unstable?
- What required judgment vs. procedure?

Observers: Select 2–3 key Post-its.

**Then: Whole-group debrief (~17 min)**

- Assistants speak first
- Users respond
- Observers share

**Time limit: 20 minutes**

---

### Slide 6 — Debrief (Extended Questions)

Same as Slide 5, plus:

Additional questions:

- How do you know when you are done?
- How did you manage scope?
- Did you act like an assistant, or like a chatbot?
- Who "owned" the assistant?

---

### Slide 7 — Role Decomposition

One person previously acted as the entire assistant.

**Issues — too many responsibilities:**
- asking questions
- tone decisions
- risk management
- enforcing boundaries
- producing text

**Real AI systems:**
- Are multi-role systems
- Include: intent interpreters, constraint checkers, generators

**Goal:**
- Decide what to split into distinct roles
- Define how users interact with each

**Time limit: 20 minutes**

---

### Slide 8 — Decomposition as Design Decision

Decomposition is a design decision, not a correctness problem.

**Reflect:**
- Should this remain one role?
- Where was it overloaded?
- What conflicted?
- Where did authority blur?
- What would you split?

**Structure**

| Phase | Activity | Duration |
|---|---|---|
| Team work | Sketch roles, capture relationships, define: name / purpose / needs / deliverables | 8 min |
| Gallery walk | Compare approaches. Mark: surprising split / same split / different approach / question | 5 min |
| Discussion | — | 7 min |

---

### Slide 9 — Decomposition Discussion

Same as Slide 8, plus:

**Discussion prompt:**

> "What different splits did teams make?"

---

### Slide 10 — Homework 1: Role Definition

For each role define:

| Field | Description |
|---|---|
| Role Name | — |
| Purpose | — |
| Behavioral rules | — |
| Boundaries / Does not do | — |
| Knowledge | — |
| Required inputs | — |
| Outputs | — |

Also:

- Draw handoffs
- Complete: *"Role A cannot do its job until Role B provides: ___"*

**Time limit: 15 minutes**

---

### Slide 11 — Sample Role Card

Same fields as Slide 10, presented as a visual role card template (name, purpose, behavioral rules, boundaries, knowledge, inputs, outputs).

---

### Slide 12 — Sample Relationship Diagram

```
User
  └── notes ──► Writer
                  └── letter ──► Critic
                                   └── recommendations ──► User
                                              (feedback loop)
```

---

### Slide 13 — Homework 2: Run with Decomposed Roles

Run with decomposed roles:

- New Goal Card
- New Rough Notes
- 10 min enactment

**Roles:**
- 1 user
- 2 system roles
- 1 observer

**Then:**
- 2 min evaluation
- Cross-team comparison
- Share splits
- Discuss what worked / broke

**Time limit: 25 minutes**

---

### Slide 14 — Homework 3: Use AI Studio

Use **AI Studio** (or your assigned coding assistant) to test what you designed.

**Test:**
- System instructions
- Knowledge sources

**Deliver:**
- Single-role card
- Decomposed roles + rationale
- Alternative decomposition
- Input/output map

**Reflection:**
- Where instability emerged
- What forced decomposition
- Why you chose your approach

---

### Slides 15–17 — Workshop Activity Photos

*(Photos of teams collaborating, Post-it observations, and role decomposition sketches from the live session.)*

---

### Slide 18 — Homework Submission Sample

*(Visual example illustrating a completed system design submission.)*

---

### Slide 19 — System Diagram Example

An example multi-agent letter writing system with the following roles:

| Role | Function |
|---|---|
| Project Coordinator | Receives user input; routes to composition roles |
| Content Architect | Structures content and argument |
| Creative Ideation Partner | Generates ideas and options |
| Voice and Tone Stylist | Applies tone and register |
| Grammar & Clarity Editor | Corrects language and improves clarity |
| Document Formatter | Formats the final output |
| Ethics & Safety Guardian | Reviews for risk and appropriateness |

**Flow:**

```
User → Coordinator → Composition Roles → Refinement → Governance → Final Letter
```

---

## Part 2 — Letter Writing Cards

> These are the workshop materials used during the bodystorming session. Each Goal Card sets the scenario. Notes are revealed in stages.

---

### Goal Card A — Resignation

> You need to write a resignation letter.
> You want to leave professionally.

**Notes — Stage 1**
- "I've learned a lot."
- "I can't stay."
- "I don't trust management."
- "Two weeks notice?"

**Notes — Stage 2** *(revealed at minute 5)*
- "I might need them as a reference."
- "There may be legal issues."
- "I am leaving for a competitor."
- "This might be read publicly."

**Notes — Stage 3** *(introduced at minute 8)*
- "Maximum 150 words."

---

### Goal Card B — Apology

> Write an apology letter.
> Repair the relationship.

**Notes — Stage 1**
- "I went too far."
- "They stopped responding."
- "I didn't mean it like that."
- "I don't want to lose this."

**Notes — Stage 2** *(revealed at minute 5)*
- "They screenshotted our messages."
- "Other people were involved."
- "I was under pressure."
- "I've apologized before."

**Notes — Stage 3** *(introduced at minute 8)*
- "Maximum 150 words."

---

### Goal Card C — Formal Complaint

> Write a formal complaint.
> Be firm but not hostile.

**Notes — Stage 1**
- "This has happened multiple times."
- "No one follows up."
- "I've documented everything."
- "I expect a response."

**Notes — Stage 2** *(revealed at minute 5)*
- "I don't want retaliation."
- "I may escalate this."
- "There were witnesses."
- "This affects my work."

**Notes — Stage 3** *(introduced at minute 8)*
- "Maximum 150 words."

---

### Goal Card D — Internal Recommendation

> Write a recommendation letter.
> Be supportive but accurate.

**Notes — Stage 1**
- "They worked under me."
- "They're talented."
- "They miss deadlines."
- "I want to be honest."

**Notes — Stage 2** *(revealed at minute 5)*
- "This is for an internal promotion."
- "My manager will read it."
- "They asked me directly."
- "There's office politics."

**Notes — Stage 3** *(introduced at minute 8)*
- "This will be posted publicly."
- "Maximum 120 words."

---

### Goal Card E — Public Statement

> Write a public statement.
> Clarify without admitting fault.

**Notes — Stage 1**
- "There was an incident."
- "It's being discussed online."
- "We value transparency."
- "We are reviewing."

**Notes — Stage 2** *(revealed at minute 5)*
- "Legal is involved."
- "We cannot disclose details."
- "People are angry."
- "There may be consequences."

**Notes — Stage 3** *(introduced at minute 8)*
- "This will be posted publicly."
- "Maximum 120 words."

---

### Goal Card F — Performance Feedback

> Write performance feedback.
> Be constructive but direct.

**Notes — Stage 1**
- "They're capable."
- "They resist feedback."
- "The team is frustrated."
- "I don't want to demoralize them."

**Notes — Stage 2** *(revealed at minute 5)*
- "This affects promotion decisions."
- "There have been complaints."
- "They don't know others are upset."
- "This must be documented."

**Notes — Stage 3** *(introduced at minute 8)*
- "This will be posted publicly."
- "Maximum 120 words."

---

## Part 3 — Building the Agentic System

> After the bodystorming session, you used AI Studio to translate your role cards and relationship diagrams into working code. Letterly is the result.

---

### The "Writers' Room" Concept

Instead of one single AI doing everything, Letterly uses a **Writers' Room** approach — a team of specialized agents working together, mirroring the decomposed roles you designed in the workshop:

1.  **Draft Generator** — Writes and rewrites the draft letter based on your rough notes and settings.
2.  **Refinement Editor** — Updates your rough notes based on your feedback so the Draft Generator can improve the letter.
3.  **Suggestions** — Reviews the draft letter against your rough notes to propose specific improvements.
4.  **Length Analyst** — Analyzes your rough notes to recommend the optimal length for the draft letter.
5.  **Line Art Generator** — Draws a custom illustration if your rough notes explicitly request a drawing or image.
6.  **Notes Sync** — Updates your rough notes to match any manual edits you make to the draft letter.
7.  **Similarity Scorer** — Calculates how accurately the draft letter matches your rough notes.
8.  **Tone Detector** — Analyzes your chat messages to detect when you're requesting a tone change (e.g., "make it more formal").
9.  **Image Request Detector** — Identifies requests for illustrations or images in your rough notes.
10. **Suggestion Matcher** — Intelligently matches your chat input to relevant editor suggestions using AI reasoning or semantic similarity.

### Customizing Your Agents

Each agent comes with default instructions that define how it behaves. You can **customize these instructions** to change how any agent works:

-   **Access the Writers' Room:** Click the gear icon (⚙️) in the top right corner to open the agent settings modal.
-   **Edit Instructions:** Click the gear icon next to any agent to enter edit mode. Modify the system instructions to change the agent's behavior (e.g., add "Always sign off with 'Cheerio!'" to make the Draft Generator include that signature).
-   **Save or Reset:** Save your custom instructions, or reset to the default behavior at any time. Custom instructions are stored locally in your browser.
-   **Visual Indicators:** Agents with custom instructions display a blue "✓ Custom Instructions" badge, while default agents show a gray "Default Instructions" badge.

### How They Collaborate

Not all agents work the same way:
-   **In Series:** The **Refinement Editor** and **Draft Generator** work as a tag team. When you ask for changes, the Editor updates the plan first, and then the Writer rewrites the letter.
-   **In the Background:** The **Suggestions**, **Length Analyst**, and **Similarity Scorer** agents work independently to analyze your work without interrupting you.
-   **On Demand:** The **Line Art Generator** only steps in when specifically invited.

---

## Part 4 — Opening the Black Box

> After presenting the first prototype, the focus shifted from building a working application to understanding what that application is actually doing.

---

### The Problem with a First Draft

A first prototype generated by AI Studio is a **black box**. There is a running application, but it is difficult to verify whether the agents inside it are behaving as designed.

Questions this stage addresses:

- Are the roles functioning as intended?
- Where are those roles located in the code?
- How can the behavior of each agent be observed and tested?

The following instructions, sent individually to AI Studio, address these questions by making the codebase more readable, the agents more inspectable, and the system easier to test.

---

### Annotations

Annotations make the generated code easier to read and maintain. Send each of the following instructions **individually** to AI Studio.

#### Verbose Code Comments
> Please provide verbose comments in all code explaining the functions to someone with no coding experience.

#### TSDoc Documentation
> Please write TSDoc documentation for all functions.

*(TSDoc is a standard format for documenting TypeScript/JavaScript code. TypeScript is an evolution of JavaScript that adds stricter rules to help catch errors.)*

#### File Headers
> Please include headers in all files describing the contents of the file to someone with no coding experience.

#### README Documentation
> Please provide or update the README file to include:
> - A description of the design goal of the application
> - An explanation of how the goal is achieved
> - Non-technical language wherever possible
> - A glossary defining uncommon terms

---

### Role Testing Platform

Once the code is annotated, the next step is to verify that each agent is doing what it was designed to do. Send each of the following instructions **individually** to AI Studio.

#### Agent Inspection Modal
> Please generate a modal showing all the agents being used in the system, including:
> - The agent name
> - The model
> - The temperature
> - The system instructions
> - Any knowledge base used
> - The agent input
> - The agent output
>
> Please provide a button in the main application that opens this modal.

#### Agent Testing Platform
> Please generate a testing platform where we can execute test cases with each agent.

#### Testing Interface Improvements
> Please modify the testing platform with:
> - An input field for providing custom input
> - A dropdown menu containing predefined test cases
>
> This will allow us to verify that the agent is generating the desired output.

---

### System Diagram

A visual diagram helps communicate how agents relate to one another and to the user. Send the following instruction to AI Studio.

#### Agentic System Diagram
> Please provide a tab in the agents modal that shows a node-and-edge system diagram for the agentic system. The diagram should include the user and show how the user interacts with the agents.

---

### Iteration

These instructions are **starting points**. Each one may need to be refined based on the output it produces. Generate, review, and adjust as needed.

---

### Exercises

1. Generate and review **annotations**. Document the results.
2. Generate and review the **role testing platform**. Document the results.
3. Generate and review the **system diagram**. Document the results.

---

### Final Presentation

The letter writing assistant will be presented in a final session on the **Thursday after Spring Break**.

Format:
- Team presentations
- Individual variations on a theme
- External guests attending

---

### AI Studio System Instructions

The block below is a starting point for the **AI Studio System Instructions** field — this is where coding assistant instructions go. It is separate from the letter writing assistant's own system instructions.

```
You are a helpful coding assistant working with a Masters of Design student at CCA. They are learning how to prototype using AI coding assistants, code, and agentic systems design. They would like additional non-technical information included in the code.

Verbose Code Comments: Please provide verbose comments in all code explaining the functions to someone with no coding experience.

TSDoc Documentation: Please write TSDoc documentation for all functions.

File Headers: Please include headers in all files describing the contents of the file to someone with no coding experience.

README Documentation: Please provide or update the project README file to include:
- A description of the design goal of the application
- An explanation of how the goal is achieved
- Non-technical language wherever possible
- A glossary defining uncommon terms
```

---

## 📖 How to Read This Code

If you are new to coding or web development, looking at a project like this can be overwhelming. Don't worry! Here is a simple guide to help you navigate:

### 1. The Structure (The House)
Think of this project like a house — different folders are like different rooms, each with a specific purpose.

- **`src/app` (The Skeleton):** This is the main structure. It decides what pages exist (like Home) and how they look generally (Layout).
- **`src/components` (The Furniture):** These are the reusable pieces we put inside the rooms. Things like buttons, text boxes, and icons are defined here.
- **`src/lib` (The Brains):** This is where the logic lives. It stores the "rules" for the AI agents and helper functions that don't need to be seen on screen.

### 2. Key Terms (Glossary)

- **Component:** A reusable building block. Imagine a Lego brick. `LetterApp.tsx` is a big brick made of smaller bricks like buttons and inputs.
- **Prop:** Short for "Property". It's how we pass information to a component. Like telling a "Button" component to be "Blue".
- **State:** The application's short-term memory. It remembers what you typed in the text box or which options you selected *right now*.
- **API (Application Programming Interface):** Think of this as a waiter. You (the frontend) give the waiter an order (data), the waiter takes it to the kitchen (server/AI), and brings back your food (the generated letter).
- **Interface:** A contract or checklist. It defines exactly what shape data must have. For example, a "User" interface might require a `name` and `email`.

---

## 🗺️ Project Tour (File Map)

Here is a quick tour of the most important files you should look at:

### The Visuals (Frontend)
- **`src/components/LetterApp.tsx`**: The heart of the app. This single file contains almost all the logic for the user interface. It handles what happens when you click "Generate" and manages custom agent instructions.
- **`src/components/AgentModelSettings.tsx`**: A modal interface that lets you choose which AI "brain" controls which part of the app, and customize system instructions for each agent.
- **`src/app/page.tsx`**: The entry point. When you visit the website, this file tells the browser to load `LetterApp`.

### The Intelligence (Backend/API)
These files mostly live in `src/app/api/`. They are the "kitchen" where the work happens.

**Main Workflow Routes:**
- **`api/generate/route.ts`**: The main writer. It takes your notes and writes the letter. Supports custom system instructions.
- **`api/refine/route.ts`**: The editor. It takes your feedback (e.g., "Make it shorter") and updates the notes. Supports custom system instructions.
- **`api/suggest/route.ts`**: The critic. It looks at your draft and suggests improvements. Supports custom system instructions.
- **`api/sync-notes/route.ts`**: The synchronizer. Detects changes made directly in the letter editor and syncs them back to your rough notes. Supports custom system instructions.

**Helper/Detection Routes:**
- **`api/detect-tone/route.ts`**: Analyzes chat messages to detect tone change requests (e.g., "make it more formal"). Supports custom system instructions.
- **`api/detect-image/route.ts`**: Identifies image/illustration requests in your rough notes. Supports custom system instructions.
- **`api/recommend-length/route.ts`**: Analyzes notes complexity to recommend optimal letter length (Short/Medium/Long). Supports custom system instructions.
- **`api/score/route.ts`**: Calculates semantic similarity score between rough notes and generated letter using embeddings.

**Suggestion Matching Routes:**
- **`api/match-suggestions/route.ts`**: Uses vector embeddings and cosine similarity to match chat input against editor suggestions.
- **`api/match-suggestions-agent/route.ts`**: Alternative approach using AI reasoning to intelligently match suggestions. Supports custom system instructions.

**Note:** All routes that use LLM agents accept an optional `systemInstruction` parameter to override the default agent behavior. Embedding-based routes (`score`, `match-suggestions`) use model selection instead.

### The Configuration (The Brains)
- **`src/lib/agent-constants.ts`**: This is the "character sheet" for our AI agents. It defines who they are (e.g., "You are an expert editor") and what they should do. **This is the most important file for prompt engineering.**
- **`src/lib/models.ts`**: Handles AI model communication, including fallback logic, OpenRouter integration, and the shared client creation.

### The Tests
- **`src/__tests__/api/`**: Unit tests for API routes using Jest to test agent behavior with default and custom instructions.
- **`src/__tests__/utils/test-helpers.ts`**: Shared test utilities (mock request builder, sample data). Not a test suite itself.
- **`e2e/`**: End-to-end test stubs for browser-based workflow testing. These are currently manual-execution outlines — see `e2e/README.md` for details.
- **`jest.config.ts`** and **`jest.setup.ts`**: Testing configuration files.

### The Eval Suite
Letterly includes a built-in **Agent Eval Suite** for testing and debugging your AI agents. Access it at [http://localhost:3000/eval](http://localhost:3000/eval) (or press `Ctrl+Shift+E` / `Cmd+Shift+E` from the main app).

**Tabs available:**
- **Comparison** — Run a single test, define assertions (contains, excludes, length, regex, valid JSON), and get immediate pass/fail feedback. Great for prompt tuning.
- **Playground** — Build multi-step agent chains, inspect each step's output, and log observations. Ideal for testing agent handoffs.
- **Batch** — Run a full suite of predefined regression tests against any agent. Track pass rates over time.
- **System Diagram** — Interactive diagram of all agents, their models, types, and relationships.

---

## 🚀 Getting Started

Want to run this on your own machine? Follow these steps:

### Prerequisites
- **Node.js**: You need to have Node.js installed. **This includes `npm` (the tool we use to install other things).** (See separate tutorial for installation steps).
    - [Download Node.js here](https://nodejs.org/) (Choose the "LTS" version).
- **Git**: You need Git to clone the repository.
    - [Download Git here](https://git-scm.com/downloads).
    - **Note:** VS Code requires this to be installed to handle your code versions. (See separate tutorial for installation steps).
- **API Keys**: You will need keys for **OpenRouter** (to access AI models) and optional **Google** keys for images. (See separate tutorial for obtaining these keys).

### Installation

1.  **Open VS Code**: Open Visual Studio Code on your computer.

2.  **Open the Terminal**:
    -   Look at the top menu bar.
    -   Click **Terminal** -> **New Terminal**.
    -   A box should appear at the bottom of your screen. This is where you talk to the computer.

3.  **Choose a Location**:
    It is best practice to keep your code in a dedicated folder (not on your Desktop!).
    
    Type these commands one by one and hit `Enter` after each:
    ```sh
    # Go to your home user folder
    cd ~

    # Create a 'repos' folder (if you don't have one)
    mkdir repos

    # Enter the folder
    cd repos
    ```

4.  **Clone the Repository**:
    Copy and paste this command into the terminal and hit `Enter`:
    ```sh
    git clone https://github.com/tj60647/Letterly.git
    ```

5.  **Go into the Folder**:
    Now tell the terminal to go inside the folder we just downloaded:
    ```sh
    cd Letterly
    ```

6.  **Install Dependencies**:
    Run this command to download all the "furniture" and tools we need:
    ```sh
    npm install
    ```

7.  **Set Up Keys**:
    Create a file named `.env.local` in the main folder and add your API keys:
    ```env
    OPENROUTER_API_KEY=sk-or-v1-...
    GOOGLE_API_KEY=AIzaSy...
    ```
    > **Note:** `OPENROUTER_API_KEY` is required. `GOOGLE_API_KEY` is **optional** — it is only needed if you want the Line Art Generator to produce images. If it is missing, image generation is silently skipped and the rest of the app works normally.

8.  **Run the App**:
    Type this command to start the server:
    ```bash
    npm run dev
    ```

9.  **Open It**: Go to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Testing

Letterly includes two types of tests to ensure quality and reliability:

### Unit Tests (API Routes)

Run automated tests for the API routes:

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**What's tested:**
- API route responses with default agent instructions
- Custom system instruction overrides
- Error handling for invalid inputs
- Model selection and fallback behavior

**Test files:**
- `src/__tests__/api/generate.test.ts` - Tests letter generation
- `src/__tests__/api/refine.test.ts` - Tests note refinement
- `src/__tests__/api/suggest.test.ts` - Tests suggestion generation

### End-to-End Tests (Browser Automation)

The `e2e/` folder contains test outlines for a full browser workflow using MCP browser tools. These are **manual execution guides**, not automated test runners — each test function is documented with the steps an MCP agent or human tester should follow.

```bash
# Prints instructions for manual/MCP execution — does not run tests automatically
npm run test:e2e
```

**Scenarios covered (manual steps):**
- Custom agent instruction workflow (edit, save, persist, reset)
- Visual feedback and UI state changes
- LocalStorage persistence across page refreshes
- Complete generation workflow with custom instructions

See `e2e/README.md` for detailed execution instructions.

---

## ⚖️ License
This project is open-source and available under the **MIT License**.
Author: **Thomas J McLeish** (c) 2026.


