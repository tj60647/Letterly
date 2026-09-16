# Letterly: Prototyping Agentic Systems

[![live site heartbeat](https://github.com/tj60647/Letterly/actions/workflows/heartbeat.yml/badge.svg)](https://github.com/tj60647/Letterly/actions/workflows/heartbeat.yml) [![CI](https://github.com/tj60647/Letterly/actions/workflows/ci.yml/badge.svg)](https://github.com/tj60647/Letterly/actions/workflows/ci.yml)

*Heartbeat red means [letterly.aroughidea.com](https://letterly.aroughidea.com/) can't use its OpenRouter key (missing, rejected, or out of credit): the pages still load, but no letter can be written.*

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

### What "Agentic System" Means Here

There is more than one working definition of an agentic system. Three are in common use, and each puts the weight somewhere different:

| Definition | A system is agentic when… | Is Letterly agentic in this sense? |
|---|---|---|
| **1. Autonomous** | A model directs its own process: it plans, chooses tools, and decides what to do next, with little human intervention at each step. | **No, by design.** The application's code sets the order in which agents run, and the author closes every loop. |
| **2. Multi-agent collaboration** | Several role-specialised agents each contribute part of the work, coordinating on a shared task. | **Yes.** Letterly's agents collaborate with the author, giving different kinds of feedback (drafting, refining notes, reviewing, recommending length, detecting tone) from a variety of input: notes, chat messages, edits to the letter, even a message still being typed. |
| **3. Mixed-initiative** | The system takes initiative alongside the person. It notices, proposes, and reshapes the interface, while the person keeps authority over the result. | **Yes.** The interface changes with the state of the system. Agents add new tones to the Tone dropdown, surface suggested review prompts that can be added to the notes with a click, highlight which suggestions a chat message addresses, and mark a recommended length. |

Letterly is agentic in the second and third senses and deliberately not in the first: the author stays in charge of the letter. When you design your own system, decide which of these you are building. The answer changes what each role is allowed to decide on its own.

*Further reading:* Anthropic, "[Building Effective AI Agents](https://www.anthropic.com/engineering/building-effective-agents)" (separates *workflows*, where code sets the path, from *agents*, where the model does). Sapkota, Roumeliotis & Karkee, "[AI Agents vs. Agentic AI: A Conceptual Taxonomy, Applications and Challenges](https://arxiv.org/abs/2505.10468)" (2025). AWS Prescriptive Guidance, "[Multi-agent collaboration](https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-patterns/multi-agent-collaboration.html)". Eric Horvitz, "Principles of Mixed-Initiative User Interfaces" (CHI 1999).

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

### Workshop Materials

The handouts for this chapter and the next are in **[workshop/](workshop/README.md)**, along with facilitator notes on choosing cards, grounding the User in a real memory, and casting roles.

---

### Phase 1 — Enact the System

> **"What makes something hard to say?"** *The user knows the goal but not the words.*

**Casting.** Take a headcount for each question and have people line up: "Who has done improv?", "Who likes to write?", "Who has done UX research?" Then assemble teams of 3–4 at a table (no laptops needed). The latest session was planned for about nine teams. Each team has:
- Someone who likes to write (**Assistant**)
- Someone who is less excited about writing (**User**)
- Some **observers**

Each team is given:

- A Goal Card
- A sheet of Rough User Notes (3–4 incomplete fragments)
- A single role: "Letter Writing Assistant"
- Post-it Notes and writing utensils

**Enact the roles you have been given. See what happens.**

**Team Structure (3–4 people)**

| Role | Responsibilities |
|---|---|
| 1 User | Behave as a real user would. Answer questions honestly, but don't volunteer information. Don't organize your thoughts for the assistant. Don't diagnose what the assistant needs. |
| 1 Letter Writing Assistant | Enact the role. |
| 1–2 Observers | **Observer 1 (Interaction Lens):** What had to happen for progress to occur? **Observer 2 (System Lens):** What would this role need to function reliably? |

**Observer Guidelines**
- Use Post-its to capture observations
- Write in fragments
- Avoid interpretation during enactment
- Avoid advising mid-session. Don't interact with the User or Assistant, just write down what you see happening.

**Time limit: 10 minutes**, one continuous run:

> **At minute 5:** The User suddenly remembers something (and reveals one additional note of their choice).
>
> **At minute 8:** The User introduces a new constraint.

Handout: [workshop/enact.md](workshop/enact.md)

---

### Phase 2 — Reflection & Debrief

**First: Individual teams process (3 min)**

Assistants, Users, Observers: review these questions.

- What did the assistant do?
- What did the assistant need?
- What did the assistant assume?
- What did the assistant produce?
- Where did it struggle?
- Where did responsibility blur?
- What felt unstable?
- What required judgment rather than procedure?

Observers: Select 2–3 key Post-its.

**Then: Volunteer debrief (~3 min per team, as time allows)**

Teams volunteer one at a time until the debrief's time is up; not every team needs to speak. For each team:

- Assistants speak first
- Users respond
- Observers share (read selected Post-its)

*This sequence is deliberately staged to lead with assistant intention, then how it was experienced, then how it was observed.*

---

### Extended Debrief Questions

Raised during the debrief:

- How do you know when you are done?
- How did you manage scope?
- Did you act like an assistant, or did you act like what you think a chatbot would do?
- Who "owned" the assistant, the user or something else?

---

### Goal Cards

Each team is assigned a Goal Card before the session begins. The current cards (A–C) give the person playing the User a scenario and ask them to *think of a time* they needed to write that letter. It doesn't have to be a profound moment. A matching sheet of Rough User Notes holds fragments to reveal in stages ("Use these, or something from your own experience. The point being you don't remember everything at once."). The person playing the Assistant does not see the card or the notes in advance.

The current printed set covers three common experiences: **resignation**, **apology**, and **formal complaint**. Three earlier cards (internal recommendation, public statement, performance feedback) are kept for groups with that kind of experience. They use the earlier format: no *think of a time* prompt, and their staged notes are printed on the card rather than on a separate sheet.

**[View the Goal Cards and Rough User Notes →](workshop/goal-cards.md)**

---

## Chapter 4 — Document the Activity Using the Framework

The bodystorming session generates raw observations. This chapter converts those observations into a structured set of design documents that can be handed directly to an implementation stage.

The framework is a documentation method developed specifically for this design process. Its purpose is to give bodystorming observations a consistent structure — one that maps directly onto the design surfaces of an agentic system. Each artifact in the framework corresponds to a distinct type of decision you will need to make during implementation.

The five framework artifacts are:

| Artifact | What it captures |
|---|---|
| **Activity Brief** | The activity, its goal, and the constraints that apply |
| **Stage-Reveal Prompt Set** | The staged information reveals used during bodystorming |
| **Role Cards** | Each role's name, purpose, engagement context, behavioral rules, interaction loop, boundaries, what it does not do, required inputs, outputs, and knowledge base |
| **Handoff Map** | Which role hands off to which, and what data passes between them |
| **Debrief Log** | Observations from the session organized by role decisions, role boundaries, role handoffs, and role knowledge base needs |

This chapter follows the order the workshop runs in. First describe the single assistant you enacted, test it, and present it. Then, as a follow-up, decompose it into several roles once you have seen where one role strains. The complete document set drives Chapter 5.

---

### Step 1 — Describe the Role

Describe the single **Letter Writing Assistant** you enacted by filling in a Role Card:

| Field | Description |
|---|---|
| Role Name | The name or identity of the role being defined. It may also imply a particular perspective, expertise, or persona. |
| Purpose | Why the role exists and the outcome it is intended to help produce. |
| Engagement Context | The situation, circumstances, or conditions in which someone approaches or engages this role. |
| Behavioral Rules | The principles, instructions, defaults, tone, personality, and ways of responding that govern how the role behaves while performing its work. |
| Interaction Loop | The recurring sequence the role follows to elicit what it needs, perform its work, check its understanding, respond to new information, and move the interaction toward an output. |
| Boundaries | The limits within which the role operates, including limits of scope, authority, responsibility, or judgment. |
| Does Not Do | The actions, decisions, responsibilities, or behaviors that are explicitly outside the role. |
| Required Inputs | The information, materials, constraints, preferences, and decisions the role needs the user to provide in order to do its work. |
| Outputs | The artifacts, information, recommendations, decisions, actions, or other results the role produces. |
| Knowledge Base | The standing knowledge the role knows or has access to in order to perform its work: facts, concepts, methods, heuristics, domain patterns, terminology, examples, documents, manuals, policies, procedures, rubrics, and other authoritative reference materials. |

Template: [workshop/role-card-template.md](workshop/role-card-template.md)

> Your cards don't need to be perfect. You will iterate on them as you get feedback on behavior.

#### Sample Role Card

A fully worked card: **Cheerful MDes Thesis Feedback Ghostwriter**, a role that helps a classmate turn a half-formed critique into a feedback letter that is useful, specific, and recognizably theirs. It shows every field filled in, including a seven-step Interaction Loop and a Knowledge Base of studio-critique heuristics.

Worked example: [workshop/role-card-example-ghostwriter.md](workshop/role-card-example-ghostwriter.md)

---

### Step 2 — Test the Role in Agent Design Studio

Use **[Agent Design Studio](https://agentstudio.aroughidea.com/)** to test what you designed before moving into code. It is a sandbox for designing behavior: a reasonably model-agnostic place to adjust the main design surfaces of an agent, without needing a provider account or a developer platform:

- The model powering the behavior
- The instructions that define its role
- The temperature that changes how consistent or exploratory it feels
- The knowledge it can use
- The user input it must interpret
- The output it produces

**Set up your letter writing assistant. Evaluate the feedback. Iterate on your design.**

Take the contents of your Role Card and put it into Agent Studio:

| Role Card field | Goes into Agent Studio as |
|---|---|
| Role Name | System Instructions |
| Purpose | System Instructions |
| Engagement Context | System Instructions |
| Behavioral Rules | System Instructions |
| Interaction Loop | System Instructions |
| Boundaries | System Instructions |
| Does Not Do | System Instructions |
| Required Inputs | System Instructions |
| Outputs | System Instructions |
| Knowledge Base | Knowledge. Keep this limited to one page for now. |

Then play the User from your Goal Card and see whether the agent behaves the way the card says it should.

In the Agent Studio view, work through its seven steps:

1. Select a model
2. Edit system instructions
3. Add/replace knowledge
4. Set the temperature
5. Edit default questions
6. Test through conversation
7. Download results

> "We are not using Agent Design Studio because it is the final production tool. We are using it because it makes agent behavior visible, testable, and discussable without requiring code."

Handout, including where Agent Design Studio fits among comparable tools: [workshop/agent-design-studio.md](workshop/agent-design-studio.md)

---

### Step 3 — Present Your Agent

> **Design Practice Question:** *How will you present the design of your agent?*
>
> **A presentation that captures the design decisions you have made, why you made them, and how you have tested them.**

Build it from three design artifacts that let others discuss and critique your agent:

| # | Artifact | What it contains |
|---|---|---|
| 1 | **Design Intent** | System Instructions, Knowledge Base, parameters |
| 2 | **System Diagram** | The agent, with what goes in and what comes out |
| 3 | **Design Quals** | Expected responses given a prompt |

These three line up with the three verification steps in Chapter 6: settings, structure, and behavior.

---

### Step 4 — Decompose the Role (Follow-Up Exercise)

Decomposition comes after the single role has been described, tested, and presented. By then, teams have seen for themselves where one role strains.

**Open by asking each team:**

- Did the assistant feel overwhelmed? Or like it was trying to do too many jobs at once? Or like it needed assistants too?
- How might the assistant describe the ideal assistants?
- Would the user wish they had more than one perspective on the letter?
- What different things might they want to compare or think about?

Then begin the decomposition exercise.

#### Phase 1 — Role Decomposition

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

#### Phase 2 — Decomposition as Design Decision

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

#### Phase 3 — Decomposition Discussion

Same as Phase 2, plus:

**Discussion prompt:**

> "What different splits did teams make?"

#### Define Each Role

Fill in a Role Card for each new role, using the same template as Step 1.

Also:

- Draw role handoffs
- Complete: *"Role A cannot do its job until Role B provides: ___"*

**Time limit: 15 minutes**

#### Sample Relationship Diagram

```
User
  └── notes ──► Writer
                  └── letter ──► Critic
                                   └── recommendations ──► User
                                              (feedback loop)
```

#### Submission Example

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

### Exercise 2 — Test the Decomposed Roles, Then Build

Test each new role in Agent Design Studio the same way you tested the single role ([Chapter 4, Step 2](#step-2--test-the-role-in-agent-design-studio)).

When the behavior is right and the system needs to become real, move into code with **AI Studio** or your assigned coding assistant. Letterly began that way, as an AI Studio prototype.

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

### A Sample Decomposition (Not Letterly's)

One possible multi-agent letter writing system, shown as an example of the deliverable. It is not how Letterly is built: Letterly's own roles follow in the next section, and its live System Diagram is in the app at `/eval`. The example has the following roles:

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

1.  **Letter Generator** — Writes and rewrites the draft letter based on your notes and settings.
2.  **Notes Editor** — Updates your notes based on your chat feedback so the Letter Generator can improve the letter. It edits the notes, never the letter.
3.  **Suggestions** — Reviews the draft letter against your notes to propose specific improvements.
4.  **Length Analyst** — Analyzes your notes to recommend the optimal length for the draft letter.
5.  **Line Art Generator** — Draws a custom illustration if your notes explicitly request a drawing or image.
6.  **Notes Sync** — Updates your notes to match any manual edits you make to the draft letter.
7.  **Suggestion Matcher** — While you type a chat message, uses AI reasoning to work out which editor suggestions the message addresses.
8.  **Similarity Scorer** — Calculates how closely the draft letter matches your notes. A similarity measure rather than an agent: it compares embeddings and takes no instruction.
9.  **Tone Request Detector** — Checks each chat message for a tone change request (e.g., "make it more formal").
10. **Image Request Detector** — Checks lines in your notes that ask to add or create an image.
11. **Suggestion Matcher Scorer** — A fallback for the Suggestion Matcher, used only when the matcher fails. Also a similarity measure: it compares embeddings and takes no instruction.

The first seven appear in the Writers' Room. The last four run behind the scenes; you can see all eleven, and how they connect, in the System Diagram, which draws the two similarity measures with cut corners.

### Customizing Your Agents

Each agent comes with default instructions that define how it behaves. You can **customize these instructions** to change how any agent works:

-   **Access the Writers' Room:** Click the **Writers' Room** button in the left panel to open the agent settings modal. You can also click the gear on any agent in the System Diagram (`/eval`, System Diagram tab).
-   **Edit Instructions:** Click the gear icon next to any agent to enter edit mode. Modify the system instructions to change the agent's behavior (e.g., add "Always sign off with 'Cheerio!'" to make the Letter Generator include that signature).
-   **Save or Reset:** Save your custom instructions, or reset to the default behavior at any time. Custom instructions are stored locally in your browser, and the Writers' Room and the System Diagram share them.
-   **Which edits take effect:** An edited instruction reaches the model for the **Letter Generator**, **Notes Editor**, **Suggestions**, **Length Analyst**, and **Notes Sync**. The Suggestion Matcher and Line Art Generator can currently be edited in the Writers' Room, but their routes still use the default instruction. The System Diagram's settings panel shows those read-only and explains why.
-   **Visual Indicators:** Agents with custom instructions display a blue "✓ Custom Instructions" badge, while default agents show a gray "Default Instructions" badge.

### How They Collaborate

Not all agents work the same way:
-   **In Series:** The **Notes Editor** and **Letter Generator** work as a tag team. When you ask for changes, the Notes Editor updates the notes first, and then the Letter Generator rewrites the letter.
-   **In the Background:** The **Suggestions**, **Length Analyst**, and **Similarity Scorer** agents work independently to analyze your work without interrupting you.
-   **On Demand:** The **Line Art Generator** only steps in when specifically invited.
-   **While You Type:** The **Suggestion Matcher** shades the suggestion chips your chat message addresses, before you send it.

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

> **A lesson from Letterly:** a diagram generated once, with its nodes and edges saved as fixed lists, stays the same when the code changes. Letterly's first diagram drifted until several of its claims no longer matched the app. The current diagram is drawn from a description of the wiring (`src/lib/agent-flow.ts`), and tests check that description against the code. When you ask your coding assistant for a diagram, ask it to draw from data the code uses too, and to test that data.

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
- The same instructions can be read and edited from the gear on each agent in the System Diagram, which also shows where an edit would not reach the model.

---

#### Verification Step 2: Verify System Structure and Flow

How to do it:
- Open the **System Diagram** to confirm that the agents, their sequence, their inputs and outputs, and the handoffs between them match your Handoff Map.
- Check that no expected agent is missing and that the data flowing between steps matches what your Role Cards describe.

In Letterly:
- Accessible via the "System Diagram" link in the Writers' Room modal header, or by navigating to `/eval` and selecting the "System Diagram" tab.
- Each field of the interface appears twice: on the left, **what you give** (grouped into fields available from the start and those that need a first draft); on the right, **what agents change**. All eleven units sit between them: nine agents and two similarity measures, drawn with cut corners.
- The agent columns are headed by what they read, not by a step number: an agent further right reads another agent's output. The columns are not an order in time.
- Pick a **story** (Generate Draft, Send a chat message, Type a chat message, and so on) to light only the wires that fire for that one action. With no story chosen, every wire is lit at once: the whole system, but not any one use of it.
- Every node has **ports**, and every **wire** is labelled with the value it carries. Hover or focus a wire to see when it fires; hover a node to see what it does.
- A **hollow port** marks an instruction you can edit that actually reaches the model. The **gear** on an agent opens its settings; for a similarity measure, the settings show what it computes, threshold included, in place of an instruction.
- A **fallback** tag marks the Suggestion Matcher Scorer, which runs only when the Suggestion Matcher fails.
- Switch between **Columns** and **ELK** layouts.

---

#### Verification Step 3: Verify Agent Behavior and System Behavior

How to do it:
- Run **epistemic evaluations** to verify that individual agents know what they are supposed to know and produce correct output for a given input (e.g., does the tone detector correctly classify the letter's register?).
- Run **mechanistic evaluations** to verify that the full agent chain handles handoffs correctly end to end (e.g., does the critic's output correctly feed the revision stage?).

In Letterly:
- Both evaluation types are available in the **Agent Eval Suite** at `/eval`.
- Use the **Comparison tab** for epistemic evaluation: run a single test against one agent, add assertions (contains, excludes, length, regex, JSON, list length), and get immediate pass/fail feedback for targeted prompt tuning.
- Use the **Playground tab** for mechanistic evaluation: chain multiple agent steps, run them in sequence, and inspect each step's status, latency, and output in a visual timeline to diagnose handoff failures. A step uses an earlier step's output when its input says `{{step-N}}`: in the built-in Full Letter Flow, the letter step 2 writes is the letter step 3 critiques.
- Use the **Batch tab** to run full regression suites across all agents, monitor pass rates, and export results before shipping prompt or model changes.
- The Eval Suite is also accessible from the "Agent Testing" link in the Writers' Room modal header.

**Defaults or your edits:** a switch above the Comparison, Playground, and Batch tabs chooses which instructions the tests send. **Your edits** sends the instructions you saved in the Writers' Room or the System Diagram, and starts selected whenever you have any; **Defaults** sends the instructions the app ships with. Each result says when it used an edited instruction. Edits are sent only to the five agents whose routes pass them to the model (the agents the System Diagram draws with an instruction port). The tests still use each agent's default model.

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
- That the System Diagram's description of the wiring still matches the code: agent inputs, routes, instruction reachability, UI labels, and which fields need a first draft
- That both diagram layouts produce drawable geometry, and that the diagram and its agent settings panel behave as described

**Test files:**
- `src/__tests__/api/generate.test.ts` - Tests letter generation
- `src/__tests__/api/refine.test.ts` - Tests note refinement
- `src/__tests__/api/suggest.test.ts` - Tests suggestion generation
- `src/__tests__/lib/agent-flow.test.ts` - Checks the System Diagram's flow description against the code
- `src/__tests__/lib/flow-layout.test.ts` - Checks the Columns and ELK layouts
- `src/__tests__/lib/custom-instructions.test.ts` - Checks the browser storage for custom instructions
- `src/__tests__/components/SystemDiagram.test.tsx` - Checks the diagram and its agent settings panel

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

#### Checks That Run on GitHub

- **CI** (`.github/workflows/ci.yml`): type check, lint, tests, and build on every pull request. The `main` branch only accepts changes through a pull request that passes it.
- **Heartbeat** (`.github/workflows/heartbeat.yml`): every 15 minutes, asks the live site's `/api/health`, which answers `200 {"ok":true}` only when the deployment's OpenRouter key is valid and has credit. A failed run emails the repository owner. GitHub can delay scheduled runs, and it disables them after 60 days without repository activity.
- **Model catalogue** (`.github/workflows/model-catalogue.yml`): every Monday, and whenever the model list changes, checks that every listed model still exists on OpenRouter. OpenRouter retires models without notice.

---

## Chapter 8 — Glossary and Project Navigation

### Key Terms (Glossary)

- **Agent:** A role in the system given a name, purpose, behavioral rules, and defined inputs and outputs. In implementation, an agent is a call to a language model with a specific system instruction. Two of Letterly's eleven units, the Similarity Scorer and the Suggestion Matcher Scorer, are not agents in this sense: they are similarity measures (see below).
- **Agentic System:** A system in which AI agents act with some initiative. There are three common working definitions: autonomous, multi-agent collaboration, and mixed-initiative. See [What "Agentic System" Means Here](#what-agentic-system-means-here) in Chapter 1. Letterly is agentic in the collaborative and mixed-initiative senses.
- **Agent Design Studio:** A workshop-scale sandbox for prototyping an agent's behavior (model, instructions, temperature, knowledge) before writing code. Open it at [agentstudio.aroughidea.com](https://agentstudio.aroughidea.com/); see [workshop/agent-design-studio.md](workshop/agent-design-studio.md).
- **Bodystorming:** A design method where participants physically enact a system's roles to discover behavioral assumptions before implementation.
- **Design Intent:** The first of three design artifacts for presenting an agent: its system instructions, knowledge base, and parameters.
- **Design Quals:** The third of the three design artifacts: expected responses given a prompt. What you check the running agent against.
- **Embedding, Similarity Measure:** An embedding is the list of numbers a model produces for a piece of text, such that texts with similar meanings get similar numbers. A similarity measure compares two embeddings (Letterly uses cosine similarity) and returns a score; code, not a model, then applies a threshold. No instruction is involved, which is why the System Diagram draws Letterly's two measures with cut corners and shows what they compute in place of an instruction.
- **Flow, Node, Port, Wire:** The System Diagram's vocabulary, shared with Agent Design Studio's Agentic Studio. A **flow** is made of **nodes** (agents and interface fields). Each node has **ports** where values come in and go out, and a **wire** joins an output port on one node to an input port on another.
- **Engagement Context:** The situation, circumstances, or conditions in which someone approaches or engages a role.
- **Interaction Loop:** The recurring sequence a role follows to elicit what it needs, perform its work, check its understanding, respond to new information, and move toward an output.
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
- **`src/components/eval/SystemDiagram.tsx`**: Draws the System Diagram from the flow description. It decides only how things look.
- **`src/components/eval/AgentSettingsPanel.tsx`**: The side panel opened from an agent's gear in the System Diagram.
- **`src/app/page.tsx`**: The entry point. When you visit the website, this file tells the browser to load `LetterApp`.

#### The Intelligence (Backend/API)
These files mostly live in `src/app/api/`. They are the "kitchen" where the work happens.

**Main Workflow Routes:**
- **`api/generate/route.ts`**: The main writer. It takes your notes and writes the letter. Supports custom system instructions.
- **`api/refine/route.ts`**: The editor. It takes your feedback (e.g., "Make it shorter") and updates the notes. Supports custom system instructions.
- **`api/suggest/route.ts`**: The critic. It looks at your draft and suggests improvements. Supports custom system instructions.
- **`api/sync-notes/route.ts`**: The synchronizer. Detects changes made directly in the letter editor and syncs them back to your notes. Supports custom system instructions.

**Helper/Detection Routes:**
- **`api/detect-tone/route.ts`**: Analyzes chat messages to detect tone change requests (e.g., "make it more formal"). Accepts a custom instruction, but the refine route that calls it never passes one.
- **`api/detect-image/route.ts`**: Identifies image/illustration requests in your notes. Accepts a custom instruction, but the generate route that calls it never passes one.
- **`api/recommend-length/route.ts`**: Analyzes notes complexity to recommend optimal letter length (Short/Medium/Long). Supports custom system instructions.
- **`api/score/route.ts`**: Calculates semantic similarity score between notes and generated letter using embeddings.

**Suggestion Matching Routes:**
- **`api/match-suggestions/route.ts`**: Uses vector embeddings and cosine similarity to match chat input against editor suggestions.
- **`api/match-suggestions-agent/route.ts`**: Alternative approach using AI reasoning to intelligently match suggestions. Reads a custom instruction but currently sends the default.

**Health Route:**
- **`api/health/route.ts`**: Answers `200 {"ok":true}` when the deployment's OpenRouter key is valid and has credit, and `503 {"ok":false}` otherwise. Used by the heartbeat; it never calls a model.

**Request Checks:** `middleware.ts` refuses requests from other websites, oversized bodies, and floods from one address. Each route also refuses models not listed in `src/lib/agent-constants.ts` and over-long instructions (`src/lib/request-guards.ts`).

**Note:** All routes that use LLM agents accept an optional `systemInstruction` parameter. Not every one uses it, as noted above; the System Diagram's hollow ports show exactly where an edit reaches the model. Embedding-based routes (`score`, `match-suggestions`) use model selection instead.

#### The Configuration (The Brains)
- **`src/lib/agent-constants.ts`**: This is the "character sheet" for our AI agents. It defines who they are (e.g., "You are an expert editor") and what they should do. **This is the most important file for prompt engineering.**
- **`src/lib/models.ts`**: Handles AI model communication, including fallback logic, OpenRouter integration, and the shared client creation.
- **`src/lib/agent-flow.ts`**: Describes how the agents and the interface are wired together, as a flow, and which story (Generate Draft, Send a chat message, and so on) each wire belongs to. The System Diagram is drawn from it, and tests check it against the code. **Update it whenever you change how agents are called.**
- **`src/lib/flow-layout.ts`**: Works out where the System Diagram's nodes, ports, and wires go, in either the Columns or ELK layout.
- **`src/lib/custom-instructions.ts`**: Reads and writes the custom instructions saved in your browser, for both the Writers' Room and the System Diagram.

#### The Tests
- **`src/__tests__/api/`**: Unit tests for API routes using Jest to test agent behavior with default and custom instructions.
- **`src/__tests__/lib/`** and **`src/__tests__/components/`**: Tests for the System Diagram's flow description, layouts, browser storage, and component.
- **`src/__tests__/utils/test-helpers.ts`**: Shared test utilities (mock request builder, sample data). Not a test suite itself.
- **`e2e/`**: End-to-end test stubs for browser-based workflow testing. These are currently manual-execution outlines — see `e2e/README.md` for details.
- **`jest.config.ts`** and **`jest.setup.ts`**: Testing configuration files.

#### The Eval Suite
Letterly includes a built-in **Agent Eval Suite** for testing and debugging your AI agents. Access it at [http://localhost:3000/eval](http://localhost:3000/eval) (or press `Ctrl+Shift+E` / `Cmd+Shift+E` from the main app).

**Tabs available:**
- **Comparison** — Run a single test, define assertions (contains, excludes, length, regex, valid JSON, list length), and get immediate pass/fail feedback. Great for prompt tuning.
- **Playground** — Build multi-step agent chains, inspect each step's output, and log observations. Write `{{step-N}}` in a step's input to use step N's output. Ideal for testing agent handoffs.
- **Batch** — Run a full suite of predefined regression tests against any agent. Track pass rates over time.
- **Defaults | Your edits** — Above those three tabs: test the default instructions, or the ones you saved.
- **System Diagram** — Every agent and interface field as nodes with ports and labelled wires, drawn from `src/lib/agent-flow.ts`. Hover to see when things fire; use an agent's gear to view or edit its settings.

---

## ⚖️ License
This project is open-source and available under the **MIT License**.
Author: **Thomas J McLeish**

> [!NOTE]
> **Author Roadmap:**
> - [ ] Create separate video tutorials for Git and Node.js installation.
> - [ ] Create guide for getting OpenRouter and Google API keys.
> - [ ] Add more "Style Match" examples for testing.
