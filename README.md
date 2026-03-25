# Letterly: Prototyping Agentic Systems

This README is organized as a tutorial. Start at the top and work your way through.

---

## Chapter 1 — Introduction: What This Tutorial Teaches

This is a design tutorial, not only a software README. You do not need a coding background to follow it.

The tutorial teaches you to design an agentic application by first understanding the activity it will perform. You will move through a structured sequence:

1. **Choose an Activity** — Select a real-world activity to model (this tutorial uses letter writing as the worked example).
2. **Bodystorm the Activity** — Physically enact the system to discover role decisions, role boundaries, role handoffs, and the knowledge each role requires.
3. **Document the Activity** — Convert your observations into a structured set of design documents using a shared framework.
4. **Translate the Documents into an Application** — Map each design document to the implementation choices that build your agentic system.
5. **Inspect and Refine Agent Behavior** — Verify that the running system matches your design across three levels: settings, structure, and behavior.

By the end of this tutorial, you will have:
- a set of design documents produced through bodystorming
- a working multi-agent application (Letterly) that emerged from that process
- tools for inspecting and refining agent behavior after implementation

Technical setup and a glossary are available at the end for readers who want to run the application locally or look up unfamiliar terms.

---

## Chapter 2 — Choose the Activity

The first step is to select a real-world activity to model. Start with this question:

> **What is something you already do — where you would genuinely benefit from a coach, a collaborator, or a team of experts helping you do it better?**

Think about activities where:
- You have some knowledge but the stakes are high enough that outside perspective would help.
- Getting it right requires navigating competing priorities, incomplete information, or difficult judgment calls.
- You would trust a knowledgeable person to advise you, but you still want to be in control of the final result.

This framing matters. You are not looking for an activity that can be fully automated — you are looking for one where a capable support team would make you better at it.

**Worked Example: Letter Writing**

Writing a letter is a good example of this kind of activity. Most people can write a letter on their own, but when the stakes are high — resigning from a job, making an apology, filing a formal complaint — the assistance of someone who can help you figure out what to say, how to say it, what tone to use, and what risks to watch for is genuinely valuable.

This tutorial uses letter writing as its worked example throughout.

---

## Chapter 3 — Bodystorm the Activity to Define Role Decisions, Role Boundaries, Role Handoffs, and Role Knowledge Base

Bodystorming is a viable technique for prototyping agentic systems and for designing behavior. It makes behavioral assumptions observable in action.

When roles are enacted under real-time conditions — using incomplete information, shifting constraints, and competing responsibilities — participants experience:

- where judgment is required
- where role boundaries are unclear
- where authority must be defined

Rather than scripting responses, designers witness how behavior emerges from role definition, inputs, and context. This allows them to articulate not just what a system should produce, but **how it should operate** — how it asks, escalates, refuses, coordinates, and adapts.

In this way, bodystorming becomes a method for discovering and shaping behavioral structure **before implementation**.

The raw observations produced by this session — organized by role decisions, role boundaries, role handoffs, and role knowledge base needs — become the inputs to the documentation stage in Chapter 4.

---

### Workshop Orientation — Design Artifacts

The artifacts generated through bodystorming in the following workshop correspond directly to the primary design surfaces of agentic systems:

- purpose
- inputs
- role knowledge base
- behavioral rules
- outputs
- role boundaries

These artifacts can be translated into:

- system instructions
- knowledge sources
- interaction contracts

Forming a structured foundation for building an agentic application.

---

### Phase 1 — Enact the System

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

### Phase 2 — Enact the System (Stage 2)

Same as Phase 1, plus:

> At minute 5: The User reveals one additional note.

---

### Phase 3 — Enact the System (Stage 3)

Same as Phase 2, plus:

> At minute 8: The User introduces a new constraint.

---

### Phase 4 — Reflection & Debrief

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

### Extended Debrief Questions

Same as Phase 4, plus:

Additional questions:

- How do you know when you are done?
- How did you manage scope?
- Did you act like an assistant, or like a chatbot?
- Who "owned" the assistant?

---

### Workshop Activity Photos

*(Photos of teams collaborating, Post-it observations, and role decomposition sketches from the live session.)*

---

### Goal Cards

Each team is assigned a Goal Card before the session begins. The card gives the person playing the User a scenario and a set of rough notes to reveal in stages. The person playing the Assistant does not see the notes in advance.

Six cards are available, covering different high-stakes letter writing situations: resignation, apology, formal complaint, internal recommendation, public statement, and performance feedback.

**[View all Goal Cards →](GOAL_CARDS.md)**

---

## Chapter 4 — Document the Activity Using the Framework

The bodystorming session generates raw observations. This chapter converts those observations into a structured set of design documents that can be handed directly to an implementation stage.

The framework is a documentation method developed specifically for this design process. Its purpose is to give bodystorming observations a consistent structure — one that maps directly onto the design surfaces of an agentic system. Each artifact in the framework corresponds to a distinct type of decision you will need to make during implementation.

The five framework artifacts are:

| Artifact | What it captures |
|---|---|
| **Activity Brief** | The activity, its goal, and the constraints that apply |
| **Stage-Reveal Prompt Set** | The staged information reveals used during bodystorming |
| **Role Cards** | Each role's name, purpose, behavioral rules, boundaries, knowledge base, inputs, and outputs |
| **Handoff Map** | Which role hands off to which, and what data passes between them |
| **Debrief Log** | Observations from the session organized by role decisions, role boundaries, role handoffs, and role knowledge base needs |

A complete document set is the output of this chapter. These documents drive everything in Chapter 5.

---

### Phase 1 — Role Decomposition

One person previously acted as the entire assistant.

**Issues — too many responsibilities:**
- asking questions
- tone decisions
- risk management
- enforcing role boundaries
- producing text

**Real AI systems:**
- Are multi-role systems
- Include: intent interpreters, constraint checkers, generators

**Goal:**
- Decide what to split into distinct roles
- Define how users interact with each

**Time limit: 20 minutes**

---

### Phase 2 — Decomposition as Design Decision

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

### Phase 3 — Decomposition Discussion

Same as Phase 2, plus:

**Discussion prompt:**

> "What different splits did teams make?"

---

### Exercise 1 — Role Definition

For each role define:

| Field | Description |
|---|---|
| Role Name | — |
| Purpose | — |
| Behavioral rules | — |
| Role Boundaries / Does not do | — |
| Role Knowledge Base | — |
| Required inputs | — |
| Outputs | — |

Also:

- Draw role handoffs
- Complete: *"Role A cannot do its job until Role B provides: ___"*

**Time limit: 15 minutes**

---

### Sample Role Card

Same fields as Exercise 1, presented as a visual role card template (name, purpose, behavioral rules, role boundaries, role knowledge base, inputs, outputs).

---

### Sample Relationship Diagram

```
User
  └── notes ──► Writer
                  └── letter ──► Critic
                                   └── recommendations ──► User
                                              (feedback loop)
```

---

### Submission Example

*(Visual example illustrating a completed system design submission.)*

---

## Chapter 5 — Translate the Documents into an Agentic Application

> After the bodystorming session and documentation stage, you used AI Studio to translate your role cards and relationship diagrams into working code. Letterly is the result.

The dominant output of your design documents is **system instructions**. System instructions serve multiple functions — they encompass multiple facets of the agent's role:

- the agent's identity and purpose *(from role decisions)*
- behavioral rules and what the agent will and will not do *(from role boundaries)*
- handoff logic and sequencing *(from role handoffs)*
- how and when to use the knowledge base *(from role knowledge base)*

A small set of things lives outside the system instructions:

| Implementation choice | Source |
|---|---|
| Model selection | Chosen based on the judgment demands of the role |
| Model parameters (e.g. temperature) | Tuned based on how precise or creative the role needs to be |
| Knowledge base documents | Attached as a separate control; instructions about how to use them go in the system instructions |

The output of this chapter is a documented design-to-implementation map: each design decision becomes a specific facet of the system instructions for the appropriate agent.

---

### Exercise 1 — Run with Decomposed Roles

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

### Exercise 2 — Use AI Studio

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

### System Diagram Example

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

## Chapter 6 — Inspect and Refine Agent Behavior

> After presenting the first prototype, the focus shifted from building a working application to understanding what that application is actually doing.

A first prototype generated by AI Studio is a **black box**. There is a running application, but it is difficult to verify whether the agents inside it are behaving as designed.

This chapter first covers the AI Studio instructions that build the inspection tools, then explains how to use those tools for three distinct verification steps.

---

### Building the Inspection Tools

Before you can verify agent behavior, you need to make the application inspectable. Send these instructions to AI Studio to add the required tools to your prototype.

#### Step 1: Make Code Inspectable

Annotations make the generated code easier to read and maintain. Send each of the following instructions **individually** to AI Studio.

##### Verbose Code Comments
> Please provide verbose comments in all code explaining the functions to someone with no coding experience.

##### TSDoc Documentation
> Please write TSDoc documentation for all functions.

*(TSDoc is a standard format for documenting TypeScript/JavaScript code. TypeScript is an evolution of JavaScript that adds stricter rules to help catch errors.)*

##### File Headers
> Please include headers in all files describing the contents of the file to someone with no coding experience.

##### README Documentation
> Please provide or update the README file to include:
> - A description of the design goal of the application
> - An explanation of how the goal is achieved
> - Non-technical language wherever possible
> - A glossary defining uncommon terms

---

#### Step 2: Generate an Agent Inspection Modal

Once the code is annotated, the next step is to build a tool for verifying that each agent is doing what it was designed to do. Send each of the following instructions **individually** to AI Studio.

##### Agent Inspection Modal
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

##### Agent Testing Platform
> Please generate a testing platform where we can execute test cases with each agent.

##### Testing Interface Improvements
> Please modify the testing platform with:
> - An input field for providing custom input
> - A dropdown menu containing predefined test cases
>
> This will allow us to verify that the agent is generating the desired output.

---

#### Step 3: Generate a System Diagram

A visual diagram helps communicate how agents relate to one another and to the user. Send the following instruction to AI Studio.

##### Agentic System Diagram
> Please provide a tab in the agents modal that shows a node-and-edge system diagram for the agentic system. The diagram should include the user and show how the user interacts with the agents.

---

### Iteration

These instructions are **starting points**. Each one may need to be refined based on the output it produces. Generate, review, and adjust as needed.

---

### Using the Inspection Tools: Three Verification Steps

Once the inspection tools are in place, run the following three verification steps. Each is exposed by a specific part of the Letterly UI.

---

#### Verification Step 1: Verify System Instructions and Model Settings Match the Design Documents

How to do it:
- Open the **Writers' Room modal** by clicking the "Writers' Room" button in the main Letterly sidebar.
- For each agent, read the displayed system instructions and confirm they reflect the role decisions, role boundaries, handoff logic, and KB usage guidance from your design documents.
- Confirm the model assignment matches the judgment demands of that role.
- Edit, reset, or override any instruction that has drifted from the design.

In Letterly:
- Triggered by the "Writers' Room" button in the main app sidebar.
- Shows each agent's name, model dropdown, and system instructions side by side.
- A gear icon opens an inline editor for each agent's instructions; a reset button restores defaults.

---

#### Verification Step 2: Verify System Structure and Flow

How to do it:
- Open the **System Diagram** to confirm that the agents, their sequence, their inputs and outputs, and the handoffs between them match your Handoff Map.
- Check that no expected agent is missing and that the data flowing between steps matches what your Role Cards describe.

In Letterly:
- Accessible via the "System Diagram" link in the Writers' Room modal header, or by navigating to `/eval` and selecting the "System Diagram" tab.
- Shows every agent in the Writers' Room, when each one fires, what data it receives, and where its output appears in the UI.

---

#### Verification Step 3: Verify Agent Behavior and System Behavior

How to do it:
- Run **epistemic evaluations** to verify that individual agents know what they are supposed to know and produce correct output for a given input (e.g., does the tone detector correctly classify the letter's register?).
- Run **mechanistic evaluations** to verify that the full agent chain handles handoffs correctly end to end (e.g., does the critic's output correctly feed the revision stage?).

In Letterly:
- Both evaluation types are available in the **Agent Eval Suite** at `/eval`.
- Use the **Comparison tab** for epistemic evaluation: run a single test against one agent, add assertions (contains, excludes, length, regex, JSON), and get immediate pass/fail feedback for targeted prompt tuning.
- Use the **Playground tab** for mechanistic evaluation: chain multiple agent steps, run them in sequence, and inspect each step's status, latency, and output in a visual timeline to diagnose handoff failures.
- Use the **Batch tab** to run full regression suites across all agents, monitor pass rates, and export results before shipping prompt or model changes.
- The Eval Suite is also accessible from the "Agent Testing" link in the Writers' Room modal header.

Output: revised system instructions and updated design documents where behavior does not match design.

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

## Chapter 7 — Optional Technical Setup and Run Instructions

> Keep technical setup available without blocking design-first learners.

Want to run this on your own machine? Follow these steps.

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

### Testing

Letterly includes two types of tests to ensure quality and reliability:

#### Unit Tests (API Routes)

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

#### End-to-End Tests (Browser Automation)

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

## Chapter 8 — Glossary and Project Navigation

### Key Terms (Glossary)

- **Agent:** A role in the system given a name, purpose, behavioral rules, and defined inputs and outputs. In implementation, an agent is a call to a language model with a specific system instruction.
- **Agentic System:** A system composed of multiple agents that collaborate, hand off work, and operate under defined role boundaries.
- **Bodystorming:** A design method where participants physically enact a system's roles to discover behavioral assumptions before implementation.
- **Role Boundaries:** What a role will and will not do. These become the behavioral rules in a system instruction.
- **Role Decisions:** The judgments a role must make during its operation.
- **Role Handoffs:** The points at which one role passes its output to another.
- **Role Knowledge Base:** The information a role needs to function — documents, rules, examples.
- **System Instructions:** The primary control for an agent's behavior. They define identity, purpose, rules, and handoff logic in a single block of text sent to the model before any user input.
- **Component:** A reusable building block. Imagine a Lego brick. `LetterApp.tsx` is a big brick made of smaller bricks like buttons and inputs.
- **Prop:** Short for "Property". It's how we pass information to a component. Like telling a "Button" component to be "Blue".
- **State:** The application's short-term memory. It remembers what you typed in the text box or which options you selected *right now*.
- **API (Application Programming Interface):** Think of this as a waiter. You (the frontend) give the waiter an order (data), the waiter takes it to the kitchen (server/AI), and brings back your food (the generated letter).
- **Interface:** A contract or checklist. It defines exactly what shape data must have. For example, a "User" interface might require a `name` and `email`.

---

### 🗺️ Project Tour (File Map)

Here is a quick tour of the most important files you should look at:

#### The Structure (The House)
Think of this project like a house — different folders are like different rooms, each with a specific purpose.

- **`src/app` (The Skeleton):** This is the main structure. It decides what pages exist (like Home) and how they look generally (Layout).
- **`src/components` (The Furniture):** These are the reusable pieces we put inside the rooms. Things like buttons, text boxes, and icons are defined here.
- **`src/lib` (The Brains):** This is where the logic lives. It stores the "rules" for the AI agents and helper functions that don't need to be seen on screen.

#### The Visuals (Frontend)
- **`src/components/LetterApp.tsx`**: The heart of the app. This single file contains almost all the logic for the user interface. It handles what happens when you click "Generate" and manages custom agent instructions.
- **`src/components/AgentModelSettings.tsx`**: A modal interface that lets you choose which AI "brain" controls which part of the app, and customize system instructions for each agent.
- **`src/app/page.tsx`**: The entry point. When you visit the website, this file tells the browser to load `LetterApp`.

#### The Intelligence (Backend/API)
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

#### The Configuration (The Brains)
- **`src/lib/agent-constants.ts`**: This is the "character sheet" for our AI agents. It defines who they are (e.g., "You are an expert editor") and what they should do. **This is the most important file for prompt engineering.**
- **`src/lib/models.ts`**: Handles AI model communication, including fallback logic, OpenRouter integration, and the shared client creation.

#### The Tests
- **`src/__tests__/api/`**: Unit tests for API routes using Jest to test agent behavior with default and custom instructions.
- **`src/__tests__/utils/test-helpers.ts`**: Shared test utilities (mock request builder, sample data). Not a test suite itself.
- **`e2e/`**: End-to-end test stubs for browser-based workflow testing. These are currently manual-execution outlines — see `e2e/README.md` for details.
- **`jest.config.ts`** and **`jest.setup.ts`**: Testing configuration files.

#### The Eval Suite
Letterly includes a built-in **Agent Eval Suite** for testing and debugging your AI agents. Access it at [http://localhost:3000/eval](http://localhost:3000/eval) (or press `Ctrl+Shift+E` / `Cmd+Shift+E` from the main app).

**Tabs available:**
- **Comparison** — Run a single test, define assertions (contains, excludes, length, regex, valid JSON), and get immediate pass/fail feedback. Great for prompt tuning.
- **Playground** — Build multi-step agent chains, inspect each step's output, and log observations. Ideal for testing agent handoffs.
- **Batch** — Run a full suite of predefined regression tests against any agent. Track pass rates over time.
- **System Diagram** — Interactive diagram of all agents, their models, types, and relationships.

---

## ⚖️ License
This project is open-source and available under the **MIT License**.
Author: **Thomas J McLeish**

> [!NOTE]
> **Author Roadmap:**
> - [ ] Create separate video tutorials for Git and Node.js installation.
> - [ ] Create guide for getting OpenRouter and Google API keys.
> - [ ] Add more "Style Match" examples for testing.
