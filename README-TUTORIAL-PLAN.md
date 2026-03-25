# README Tutorial Plan (For Review)

This is a review-first plan only.
No README content changes are proposed until you approve.

## Goal
Restructure the README to function as a tutorial on designing an agentic application for readers with little or no coding background.

## Core Sequence (Your Tutorial Logic)
1. Identify an activity (example: letter writing).
2. Bodystorm the activity.
3. Use bodystorming to understand:
- role decisions
- role boundaries
- role handoffs
- role knowledge base
4. Document the activity using your document framework.
5. Use those documents to build an app.
6. Improve chapter titles so they are accurate and descriptive.

## Proposed Chapter Structure (Draft)
1. Introduction: What This Tutorial Teaches
2. Choose the Activity
3. Bodystorm the Activity to Define Role Decisions, Role Boundaries, Role Handoffs, and Role Knowledge Base
4. Document the Activity Using the Framework
5. Translate the Documents into an Agentic Application
6. Inspect and Refine Agent Behavior
7. Optional Technical Setup and Run Instructions
8. Glossary and Project Navigation

## Chapter-by-Chapter Plan

### 1) Introduction: What This Tutorial Teaches
Purpose:
- explain that this is a design tutorial, not only a software README
- set expectation for low-tech audience

Output:
- reader knows the full tutorial path and expected deliverables

### 2) Choose the Activity
Purpose:
- define the real-world activity to model

Include:
- short criteria for selecting an activity
- letter writing as worked example

Output:
- one selected activity with a clear goal

### 3) Bodystorm the Activity to Define Role Decisions, Role Boundaries, Role Handoffs, and Role Knowledge Base
Purpose:
- run bodystorming as the main discovery method

Include:
- role enactment instructions
- staged reveal structure
- observer prompts focused on role decisions, role boundaries, role handoffs, and role knowledge base needs

Output:
- raw observations organized by those four focus areas

### 4) Document the Activity Using the Framework
Purpose:
- convert observations into structured design documents

Include your framework artifacts:
- Activity Brief
- Stage-Reveal Prompt Set
- Role Cards
- Handoff Map
- Debrief Log

Output:
- a complete document set ready for implementation

### 5) Translate the Documents into an Agentic Application
Purpose:
- map each design document to implementation choices

The dominant output of your design documents is system instructions.
System instructions are not a single field — they have a role composed of many facets:
- the agent's identity and purpose (from role decisions)
- behavioral rules and what the agent will and will not do (from role boundaries)
- handoff logic and sequencing (from role handoffs)
- how and when to use the knowledge base (from role knowledge base)

The small set of things that live outside the system instructions:
- model selection (chosen based on the judgment demands of the role)
- model parameters such as temperature (tuned based on how precise or creative the role needs to be)
- the knowledge base documents themselves (attached as a separate control; instructions about how to use them go in the system instructions)

Output:
- a documented design-to-implementation map showing which design decisions become which facets of the system instructions

### 6) Inspect and Refine Agent Behavior
Purpose:
- verify that implementation matches design across three levels: settings, structure, and behavior

This chapter has three distinct verification steps, each exposed by a specific part of the Letterly UI.

#### Step 1: Verify system instructions and model settings match the design documents
How to do it:
- Open the **Writers' Room modal** by clicking the "Writers' Room" button in the main Letterly sidebar.
- For each agent, read the displayed system instructions and confirm they reflect the role decisions, role boundaries, handoff logic, and KB usage guidance from your design documents.
- Confirm the model assignment matches the judgment demands of that role.
- Edit, reset, or override any instruction that has drifted from the design.

In Letterly:
- Triggered by the "Writers' Room" button in the main app sidebar.
- Shows each agent's name, model dropdown, and system instructions side by side.
- A gear icon opens an inline editor for each agent's instructions; a reset button restores defaults.

#### Step 2: Verify system structure and flow
How to do it:
- Open the **System Diagram** to confirm that the agents, their sequence, their inputs and outputs, and the handoffs between them match your Handoff Map.
- Check that no expected agent is missing and that the data flowing between steps matches what your Role Cards describe.

In Letterly:
- Accessible via the "System Diagram" link in the Writers' Room modal header, or by navigating to `/eval` and selecting the "System Diagram" tab.
- Shows every agent in the Writers' Room, when each one fires, what data it receives, and where its output appears in the UI.

#### Step 3: Verify agent behavior and system behavior
How to do it:
- Run **epistemic evaluations** to verify that individual agents know what they are supposed to know and produce correct output for a given input (e.g., does the tone detector correctly classify the letter's register?).
- Run **mechanistic evaluations** to verify that the full agent chain handles handoffs correctly end to end (e.g., does the critic's output correctly feed the revision stage?).

In Letterly:
- Both evaluation types are available in the **Agent Eval Suite** at `/eval`.
- Use the **Comparison tab** for epistemic evaluation: run a single test against one agent, add assertions (contains, excludes, length, regex, JSON), and get immediate pass/fail feedback for targeted prompt tuning.
- Use the **Playground tab** for mechanistic evaluation: chain multiple agent steps, run them in sequence, and inspect each step's status, latency, and output in a visual timeline to diagnose handoff failures.
- Use the **Batch tab** to run full regression suites across all agents, monitor pass rates, and export results before shipping prompt or model changes.
- The Eval Suite is also accessible from the "Agent Testing" link in the Writers' Room modal header.

Output:
- revised system instructions and updated design documents where behavior does not match design

### 7) Optional Technical Setup and Run Instructions
Purpose:
- keep technical setup available without blocking design-first learners

Output:
- runnable local environment for readers who want to build

### 8) Glossary and Project Navigation
Purpose:
- support readers with little technical background

Output:
- fast lookup for unfamiliar terms and where to find key files

## What Stays vs What Changes
Stays:
- existing workshop foundation
- letter-writing worked example
- existing app/testing sections (as optional technical track)

Changes:
- clearer tutorial framing for broad audience
- stronger design-first sequence
- explicit use of your framework
- more accurate, descriptive chapter titles

## Review Questions
1. Are these chapter titles aligned with your tutorial language?
2. Do you want all current goal cards in the core flow, or some moved to optional exercises?
3. Should this remain one README, or split into README plus a separate tutorial file later?

## Next Step (After Your Approval)
Apply this structure directly to README.md in a single pass, preserving your existing content where possible and only restructuring/relabeling for tutorial clarity.
