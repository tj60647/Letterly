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
- verify that implementation matches design

Include:
- behavior checks tied to the document framework
- revision loop when outputs do not match role decisions or role boundaries

Output:
- revised instructions and updated documents where needed

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
2. Should chapter 6 focus only on behavior testing, or include model/settings decisions too?
3. Do you want all current goal cards in the core flow, or some moved to optional exercises?
4. Should this remain one README, or split into README plus a separate tutorial file later?

## Next Step (After Your Approval)
Apply this structure directly to README.md in a single pass, preserving your existing content where possible and only restructuring/relabeling for tutorial clarity.
