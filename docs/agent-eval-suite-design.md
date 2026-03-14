# Letterly Agent Eval Suite - Enhanced Design Specification

## Overview

A comprehensive, lightweight testing environment for systematically evaluating AI agent behavior across the Letterly application. The suite provides three complementary modes—Comparison, Playground, and Batch Runner—accessible from a unified interface, enabling both quick ad-hoc testing and systematic regression validation.

**Design Philosophy:** Every interface element should be self-documenting through contextual help, tooltips, and information modals. Users should never feel lost or uncertain about what a feature does.

---

## Global Layout & Navigation

### Primary Access Point
- **Route:** `/eval` as a standalone page in the application
- **Navigation Link:** Add "Agent Testing" link in the Writers' Room settings panel with a beaker/flask icon
- **Alternative Access:** Keyboard shortcut (`Ctrl+Shift+E` / `Cmd+Shift+E`) for quick access

### Top-Level Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  🧪 Letterly Agent Eval Suite  ℹ️        [Comparison][Playground][Batch]  │
│  Test and validate AI agent behavior across your application    │
│  ═══════════════════════════════════════════════════════════════ │
│                                                                  │
│  [Mode-specific content area]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Header:**
- **Title:** "🧪 Letterly Agent Eval Suite" with info icon ℹ️
  - **Info Icon Click:** Opens modal explaining the purpose of the eval suite, what each mode does, and when to use each
  - **Modal Content:**
    ```
    📚 About Agent Eval Suite
    
    The Agent Eval Suite helps you test and validate how AI agents behave
    in your application. Use it to:
    
    ✓ Verify agents respond correctly to specific inputs
    ✓ Test custom system instructions work as expected
    ✓ Catch regressions when updating agent prompts
    ✓ Understand multi-agent workflow behavior
    ✓ Compare expected vs actual outputs
    
    Three Testing Modes:
    
    🔍 COMPARISON - Quick single-test validation with side-by-side results
       Best for: Spot-checking specific behaviors, validating fixes
    
    🎮 PLAYGROUND - Interactive multi-step workflow exploration
       Best for: Understanding agent chains, exploratory testing
    
    📊 BATCH RUNNER - Automated regression testing across test suites
       Best for: Pre-deployment validation, systematic QA
    
    [Watch Tutorial Video] [View Documentation] [Close]
    ```

- **Subtitle:** "Test and validate AI agent behavior across your application"
  - Appears below title in smaller text
  - Helps users immediately understand the purpose

- **Three Mode Tabs:** Pill-shaped buttons with enhanced descriptions
  - **Comparison Tab:** 
    - Label: "🔍 Comparison"
    - Subtitle (appears on hover): "Validate single tests with expected vs actual comparison"
  - **Playground Tab:**
    - Label: "🎮 Playground"
    - Subtitle (appears on hover): "Explore multi-step agent workflows interactively"
  - **Batch Runner Tab:**
    - Label: "📊 Batch Runner"
    - Subtitle (appears on hover): "Run automated test suites for regression testing"
  - Active tab: Highlighted with accent color, elevated appearance, and subtle arrow indicator

- **Global Actions (top-right):**
  - **← Back to Letterly** - Return link with icon
  - **📤 Export** - Export current session data (with dropdown for format)
  - **⚙️ Settings** - Global settings gear icon
  - **❓ Help** - Help icon opening comprehensive guide

---

## Mode A: Comparison Dashboard

### Tab Header with Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 Comparison Mode  ℹ️                                         │
│  Quick validation with side-by-side expected vs actual results  │
│  ────────────────────────────────────────────────────────────   │
```

**Info Icon Modal (Comparison Mode):**
```
📖 Comparison Mode - Quick Start Guide

PURPOSE:
Run single tests and compare expected vs actual agent outputs.
Ideal for validating specific agent behaviors and catching regressions.

HOW IT WORKS:
1. Select a predefined test or create custom test
2. Choose an agent and optionally override the model
3. Define input parameters and expected behavior
4. Run the test to see side-by-side comparison
5. View pass/fail status based on assertions

WHEN TO USE:
✓ Testing a specific agent behavior after prompt changes
✓ Validating custom system instructions work correctly
✓ Quick spot-checks during development
✓ Creating new test cases for your test suite

TIP: Save frequently used tests to "Custom Tests" for easy reuse.

[View Example Workflow] [Close]
```

### Layout Structure

```
┌─────────────────────┬─────────────────────────────────────────────┐
│  Test Suites  ℹ️    │  Test Configuration  ℹ️                    │
│                     │                                             │
│  📂 GENERATE  ℹ️    │  Agent: [Dropdown ▼]  ℹ️                   │
│    ├─ Short letter  │  Model Override: [Dropdown ▼]  ℹ️          │
│    ├─ Style mimicry │                                             │
│    └─ Image detect  │  ─────────────────────────────────────────  │
│                     │  Prompt / Input Parameters  ℹ️              │
│  📂 REFINE  ℹ️      │  ┌──────────────────────────────────────┐ │
│    ├─ Add info      │  │ [Editable text area]                  │ │
│    ├─ Preserve      │  │ Or JSON input for complex params      │ │
│    └─ Tone ignore   │  └──────────────────────────────────────┘ │
│                     │  [JSON Mode Toggle]  ℹ️                    │
│  📂 SUGGEST  ℹ️     │                                             │
│    └─ Ambiguity     │  Expected Behavior / Assertions  ℹ️        │
│                     │  ┌──────────────────────────────────────┐ │
│  📂 Custom Tests    │  │ Type: [Dropdown ▼]  ℹ️                │ │
│    └─ [+ New]       │  │ Value: [Input field]                  │ │
│                     │  │ [+ Add Assertion]  ℹ️                 │ │
│  Recent Tests (5) ℹ️│  └──────────────────────────────────────┘ │
│  • Test 1 ✓ 234ms   │                                             │
│  • Test 2 ✗ 401ms   │  [▶ Run Test]  [💾 Save as Scenario]      │
│                     │                                             │
│  [Clear History]    │  ─────────────────────────────────────────  │
│                     │  Results  ℹ️                                │
│                     │                                             │
│                     │  ┌─────────────────┬─────────────────────┐│
│                     │  │  Expected       │  Actual             ││
│                     │  │  Output  ℹ️     │  Output  ℹ️         ││
│                     │  ├─────────────────┼─────────────────────┤│
│                     │  │ [Text content]  │ [Text content]      ││
│                     │  │                 │                     ││
│                     │  │                 │ Status: ✓ Passed    ││
│                     │  │                 │ Model: gpt-oss-120b ││
│                     │  │                 │ Latency: 245ms  ℹ️  ││
│                     │  │                 │ Tokens: 180  ℹ️     ││
│                     │  └─────────────────┴─────────────────────┘│
│                     │                                             │
│                     │  Assertion Results:  ℹ️                    │
│                     │  ✓ Contains "Professional"                  │
│                     │  ✓ Word count between 50-150                │
│                     │  ✗ Excludes "Casual" (Found at line 2)  ℹ️ │
└─────────────────────┴─────────────────────────────────────────────┘
```

### Information Icons & Modals

#### Test Suites Section ℹ️
**Tooltip:** "Predefined and custom test scenarios"

**Modal Content:**
```
📁 Test Suites Explained

PREDEFINED TESTS:
Organized by agent type, these are battle-tested scenarios that cover
common use cases and edge cases for each agent.

• Click any test to load its configuration
• Green ✓ = test passed last run
• Red ✗ = test failed last run
• Gray = not yet run in this session

CUSTOM TESTS:
Your saved test scenarios. Create reusable tests for your specific
use cases.

• Click [+ New] to create a blank test
• Hover over any test to see edit/delete options
• Drag to reorder your custom tests

TIP: Start with predefined tests to understand test structure,
then create custom tests for your specific needs.

[Close]
```

#### Agent Selector ℹ️
**Tooltip:** "Choose which agent to test"

**Modal Content:**
```
🤖 Agent Selection

Select the agent you want to test from the dropdown. Each agent has
a specific purpose:

GENERATE - Writes draft letters from rough notes
REFINE - Updates notes based on feedback
SUGGEST - Proposes improvements to drafts
DETECT_TONE - Identifies tone change requests
MATCH_SUGGESTIONS - Matches chat to suggestions
... [full agent list]

MODEL OVERRIDE (Optional):
By default, tests use each agent's primary model. Override this to:
• Test behavior across different models
• Compare model performance
• Validate fallback model compatibility

[View Agent Documentation] [Close]
```

#### JSON Mode Toggle ℹ️
**Tooltip:** "Switch between simple text and advanced JSON input"

**Modal Content:**
```
📝 Input Modes

SIMPLE MODE (Default):
Enter prompt or input text directly in the text area.
Best for basic testing.

JSON MODE (Advanced):
Define complex parameters as JSON object. Required when testing
routes that need multiple parameters.

Example JSON structure:
{
  "recipient": "Sarah Chen",
  "sender": "Michael Torres",
  "tone": "Professional",
  "length": "Short",
  "roughNotes": "- Request update\n- Set meeting"
}

TIP: Click "Load from example..." to see JSON templates
for each agent.

[View JSON Schema Reference] [Close]
```

#### Assertions ℹ️
**Tooltip:** "Define success criteria for this test"

**Modal Content:**
```
✅ Assertion Types

Assertions define what makes a test pass or fail. You can chain
multiple assertions for comprehensive validation.

AVAILABLE ASSERTION TYPES:

• Contains
  Text must include a specific substring
  Example: "Professional" must appear in output
  
• Excludes
  Text must NOT include a specific substring
  Example: "Casual" should not appear
  
• Length Between
  Character or word count must fall within range
  Example: Output between 50-150 words
  
• Tone Matches
  Output exhibits specific tonal characteristics
  Example: Formal language indicators present
  
• JSON Valid
  Output must be valid, parseable JSON
  Example: Suggestion arrays properly formatted
  
• Regex Match
  Output matches a regular expression pattern
  Example: Email format validation
  
• Custom Function
  Write JavaScript to define custom validation logic
  Example: Check for specific structure

TIP: Start with simple Contains/Excludes assertions, then add
more specific checks as needed.

[View Assertion Examples] [Close]
```

#### Latency Metric ℹ️
**Tooltip:** "Time taken for agent to respond"

**Modal Content:**
```
⏱️ Understanding Latency

Latency measures how long the agent took to generate a response,
from API call to result return.

TYPICAL RANGES:
• Fast: < 200ms - Simple classifications, embeddings
• Normal: 200-500ms - Standard generations
• Slow: 500ms+ - Complex reasoning, long outputs

FACTORS AFFECTING LATENCY:
• Model size (larger = slower but more capable)
• Output length (longer = more time)
• System load (peak times may be slower)
• Network conditions

WHY IT MATTERS:
Track latency to ensure user experience remains responsive.
Significant latency increases may indicate problems.

[View Performance Benchmarks] [Close]
```

#### Token Count ℹ️
**Tooltip:** "Number of tokens used (input + output)"

**Modal Content:**
```
🔢 Token Usage

Tokens are the basic units AI models process. Roughly:
• 1 token ≈ 4 characters in English
• 1 token ≈ ¾ of a word on average

This count includes:
• Input tokens (your prompt + system instruction)
• Output tokens (agent's response)

WHY IT MATTERS:
• Cost: Most AI APIs charge per token
• Context limits: Models have max token windows
• Performance: More tokens = slower response

TYPICAL RANGES:
• GENERATE: 150-300 tokens (short), 300-600 (long)
• REFINE: 100-200 tokens
• SUGGEST: 80-150 tokens

TIP: If token counts seem high, review your system instructions
and prompts for unnecessary verbosity.

[View Token Optimization Guide] [Close]
```

#### Failed Assertion ℹ️
**Tooltip:** "Click for detailed failure analysis"

**Modal Content:**
```
❌ Assertion Failure Details

Assertion: Excludes "Casual"
Status: FAILED

WHAT HAPPENED:
Expected the output to NOT contain the word "Casual", but it was
found in the response.

LOCATION:
Line 2, Column 15: "...hope this casual note finds you well..."

POSSIBLE CAUSES:
• System instruction not specific enough about tone
• Model interpreting "Professional" differently than expected
• Training data includes mixed examples
• Custom instruction override conflicting with tone request

RECOMMENDED ACTIONS:
1. Review the system instruction for tone guidance
2. Add explicit examples of professional greetings
3. Test with different model to compare behavior
4. Adjust assertion if "casual" is actually acceptable here

[View Full Output] [Edit Test] [Re-run] [Close]
```

---

## Mode B: Agent Playground

### Tab Header with Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  🎮 Playground Mode  ℹ️                                         │
│  Explore agent workflows interactively with step-by-step execution │
│  ────────────────────────────────────────────────────────────   │
```

**Info Icon Modal (Playground Mode):**
```
🎯 Playground Mode - Interactive Testing

PURPOSE:
Execute multi-step agent workflows and observe behavior at each stage.
Ideal for understanding how agents work together and exploratory testing.

HOW IT WORKS:
1. Define an agent chain (sequence of agents to execute)
2. Configure input for first step
3. Execute steps one-by-one or in sequence
4. Observe output at each stage
5. Fork workflows to test alternate paths
6. Take notes on behavior observations

WHEN TO USE:
✓ Understanding how agent chains work together
✓ Debugging complex multi-agent workflows
✓ Exploring edge cases and unexpected behaviors
✓ Documenting agent interactions for team knowledge
✓ Designing new multi-step features

KEY FEATURES:
• Step-by-step execution with output inspection
• Fork workflows to test "what if" scenarios
• Manual observation notes with markdown support
• Auto-pass data between chained agents

TIP: Use Playground to understand behavior, then create
Comparison tests to validate specific cases.

[View Example Workflow] [Close]
```

### Layout Structure with Enhanced Descriptions

```
┌─────────────────────────────────────────────────────────────────┐
│  Scenario: [Dropdown: Load predefined / Clear / Save]  ℹ️       │
│  Agent Chain: [GENERATE] → [SUGGEST] → [REFINE]  [Edit Chain] ℹ️│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Execution Timeline  ℹ️                                         │
│  Follow your test from start to finish, step by step            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Step 1: GENERATE  ℹ️                            [Expand ▼]  ││
│  │ Generate a draft letter from rough notes                   ││
│  │ ─────────────────────────────────────────────────────────  ││
│  │ Input: {recipient: "Sarah", tone: "Professional", ...}  ℹ️ ││
│  │ [Edit Input JSON]  [▶ Run Step 1]                          ││
│  │                                                              ││
│  │ ▼ Output (Expanded):                                        ││
│  │ ┌──────────────────────────────────────────────────────┐  ││
│  │ │ Dear Sarah,                                           │  ││
│  │ │ I hope this finds you well...                         │  ││
│  │ └──────────────────────────────────────────────────────┘  ││
│  │ Model: gpt-oss-120b | Latency: 234ms  ℹ️ | Tokens: 180 ℹ️││
│  │ [⚡ Continue to Step 2] [🔄 Retry with Changes] [⤴ Fork] ℹ️││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Step 2: SUGGEST  ℹ️                             [Expand ▼]  ││
│  │ Analyze draft and propose improvements                     ││
│  │ ─────────────────────────────────────────────────────────  ││
│  │ Input: (Using output from Step 1)  ℹ️                      ││
│  │ [▶ Run Step 2]                                             ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Step 3: REFINE  ℹ️                         [Not executed]   ││
│  │ Update notes based on feedback                             ││
│  │ ─────────────────────────────────────────────────────────  ││
│  │ Input: (Pending...)  ℹ️                                     ││
│  │ [Configure Input]  [▶ Run Step 3]                          ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Test Observations & Notes  ℹ️                                  │
│  Document what you learn about agent behavior                   │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ [Markdown editor with formatting toolbar]                   ││
│  │ • Use @step1 to reference specific steps                    ││
│  │ • Add screenshots via drag-and-drop                         ││
│  │ • Click [T] to insert timestamp                             ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Information Icons & Modals

#### Agent Chain ℹ️
**Tooltip:** "Sequence of agents to execute in order"

**Modal Content:**
```
🔗 Agent Chains Explained

An agent chain is a sequence of agents that work together to accomplish
a task. Each agent's output becomes the next agent's input.

EXAMPLE CHAIN:
GENERATE → SUGGEST → REFINE

1. GENERATE creates a draft letter
2. SUGGEST reviews draft and proposes improvements
3. REFINE updates notes based on suggestions

EDITING CHAINS:
Click [Edit Chain] to:
• Add new steps to the chain
• Remove unnecessary steps
• Reorder steps (drag and drop)
• Test different agent sequences

VALIDATION:
The system prevents invalid chains (e.g., SUGGEST without a draft
to analyze). Pay attention to validation warnings.

BEST PRACTICES:
• Start simple (2-3 steps) before complex chains
• Ensure each step produces output the next step needs
• Use Playground to prototype, Comparison to validate

[View Common Chains] [Chain Builder Tutorial] [Close]
```

#### Step Input ℹ️
**Tooltip:** "Data passed into this agent"

**Modal Content:**
```
📥 Step Input Configuration

Each step in the chain needs input data. This can come from:

MANUAL INPUT:
You define the exact parameters via JSON. Use this for:
• The first step in a chain
• Testing with specific, controlled data
• Overriding auto-pass data from previous step

AUTO-PASS INPUT:
The system automatically uses the previous step's output.
Best for:
• Steps 2+ in a workflow
• Natural data flow between agents
• Realistic end-to-end testing

MIXED INPUT:
Combine previous output with additional parameters.
Example: Pass draft letter from GENERATE, but add custom
feedback text for REFINE step.

[Edit Input]  [View Input Schema]  [Reset to Auto]  [Close]
```

#### Fork Action ℹ️
**Tooltip:** "Create alternate branch from this point"

**Modal Content:**
```
🌿 Forking Workflows

Fork a workflow to create an alternate path from any step.
Useful for "what if" testing scenarios.

EXAMPLE USE CASES:

Scenario: You have GENERATE → SUGGEST running successfully
Fork to test: What if we use REFINE instead of SUGGEST?

Original: GENERATE → SUGGEST → REFINE
Fork 1:   GENERATE → REFINE (different feedback)
Fork 2:   GENERATE → SUGGEST (different model)

HOW IT WORKS:
1. Click [⤴ Fork] on any completed step
2. System creates new workflow starting from that step
3. Output from that step is preserved as starting point
4. Modify subsequent steps or add new ones
5. Compare results across original and forked workflows

FORKED WORKFLOWS:
• Are saved separately in session history
• Don't affect the original workflow
• Can be saved as new scenarios
• Great for A/B testing different approaches

[View Fork Examples] [Close]
```

#### Observations Notes ℹ️
**Tooltip:** "Document your findings and observations"

**Modal Content:**
```
📝 Observation Notes

Use this area to document what you learn during exploratory testing.
This becomes valuable knowledge for your team.

WHAT TO DOCUMENT:
• Unexpected behaviors or edge cases
• Patterns in agent responses
• Ideas for improvements
• Questions to investigate further
• Bugs or issues discovered

MARKDOWN SUPPORT:
Format your notes with:
• **bold** and *italic*
• ## Headings
• - Bullet lists
• [Links](url)
• `code snippets`

SPECIAL FEATURES:
• @step1 - Creates link to specific step output
• [T] button - Inserts current timestamp
• Drag & drop - Add screenshots
• Auto-save - Never lose your notes

EXPORT OPTIONS:
• Export as markdown file
• Include in test reports
• Share with team members

TIP: Good observation notes become the basis for future
automated test cases.

[View Note Templates] [Export Notes] [Close]
```

---

## Mode C: Batch Test Runner

### Tab Header with Summary

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Batch Runner Mode  ℹ️                                       │
│  Run automated test suites for comprehensive regression testing │
│  ────────────────────────────────────────────────────────────   │
```

**Info Icon Modal (Batch Runner Mode):**
```
🚀 Batch Runner - Automated Testing

PURPOSE:
Execute multiple tests automatically to validate agent behavior
across many scenarios. Essential for regression testing and QA.

HOW IT WORKS:
1. Select a test suite (predefined or custom)
2. Configure execution settings (parallel/sequential, failure handling)
3. Click [▶ Run All Tests]
4. Monitor progress as tests execute
5. Review results summary with pass/fail counts
6. Export detailed reports for documentation

WHEN TO USE:
✓ Before deploying changes to production
✓ After modifying agent system instructions
✓ Regular regression testing schedule
✓ Validating across multiple models or configurations
✓ Creating baseline performance metrics

KEY FEATURES:
• Automated execution of multiple tests
• Real-time progress tracking
• Detailed pass/fail reporting
• Baseline comparison for regression detection
• HTML/PDF report generation
• Re-run failed tests quickly

EXECUTION STRATEGIES:
• Sequential: One test at a time (safer, slower)
• Parallel: Multiple tests simultaneously (faster, requires more resources)

SUCCESS METRICS:
• Pass Rate: % of tests passing
• Average Latency: Typical response time
• Coverage: % of agents with tests
• Regression: New failures vs baseline

TIP: Run Batch Runner before every deployment to catch
regressions early.

[View Setup Guide] [Best Practices] [Close]
```

### Layout Structure with Enhanced Information

```
┌─────────────────────────────────────────────────────────────────┐
│  Test Suite: [Dropdown: Core Agents / Custom / All]  ℹ️         │
│  [▶ Run All Tests]  [⏸ Pause]  [⚙ Configure] ℹ️  [📊 Report] ℹ️│
├─────────────────────────────────────────────────────────────────┤
│  Progress: ████████░░░░░░ 8 / 15 tests (53%)  ⏱ 2m 14s  ℹ️    │
│  Estimated time remaining: 3m 06s                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Test Results by Agent  ℹ️                                      │
│  Click any test to view detailed results                        │
│                                                                  │
│  ┌─ GENERATE Tests  ℹ️ ───────────────────────── [3/5 passed] ┐│
│  │ ✓ Short letter generation                    245ms  ℹ️      ││
│  │ ✓ Tone preservation - Professional           301ms          ││
│  │ ✗ Style mimicry with example                 425ms  [View] ║│
│  │   └─ 2 of 3 assertions failed  [Details ▼]  ℹ️              ││
│  │        ✓ Generated output present                           ││
│  │        ✗ Contains style markers (Missing formal greeting)   ││
│  │        ✗ Excludes casual language (Found: "hey")            ││
│  │   [Re-run Test] [Edit Test] [View Full Output]              ││
│  │ ⏸ Image request detection               [Pending...]        ││
│  │ ⏸ Multi-language output - Spanish        [Pending...]        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─ REFINE Tests  ℹ️ ────────────────────────── [3/3 passed]  ┐│
│  │ ✓ Preserve existing notes                    189ms          ││
│  │ ✓ Add new information only                   234ms          ││
│  │ ✓ Tone detection isolation                   156ms          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [... More agent test groups ...]                               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Summary  ℹ️                                                     │
│  Overall test health and performance metrics                    │
│  ────────────────────────────────────────────────────────────   │
│  🟢 5 passed  🔴 1 failed  🟡 2 warnings  ⚪ 7 pending          │
│  Pass Rate: 83% (5/6 completed)  [Target: 95%] ℹ️              │
│  Avg Latency: 247ms  [Baseline: 235ms] ℹ️                      │
│  Total Time: 2m 14s  Models Used: 3 unique  ℹ️                 │
│  Coverage: 87% of agents tested  [View gaps] ℹ️                │
│                                                                  │
│  [📄 Export Report] ℹ️  [💾 Save as Baseline] ℹ️               │
│  [🔄 Re-run Failed] ℹ️  [📊 Compare to Baseline] ℹ️            │
└─────────────────────────────────────────────────────────────────┘
```

### Information Icons & Modals

#### Configure Settings ℹ️
**Tooltip:** "Adjust execution behavior and failure handling"

**Modal Content:**
```
⚙️ Batch Runner Configuration

EXECUTION STRATEGY:
○ Sequential (Recommended)
  Runs one test at a time. Safer and easier to debug.
  Slower but more stable.

○ Parallel
  Runs multiple tests simultaneously. Faster but requires
  more system resources. May cause rate limiting with some
  AI providers.

  Parallelism: [2] [4] [8] tests at once

FAILURE HANDLING:
○ Continue on Failure (Recommended)
  Complete all tests even if some fail. Best for getting
  full picture of test health.

○ Stop on First Failure
  Halt execution at first failure. Good for quick validation
  when you expect all tests to pass.

○ Stop on Suite Failure
  Continue within a suite but stop if entire suite fails.
  Balances thoroughness with efficiency.

RETRY SETTINGS:
Auto-retry failed tests: [✓]
Number of retries: [1] [2] [3]

Reason: Occasional network issues or rate limits can cause
spurious failures. One retry often resolves transient issues.

NOTIFICATIONS:
○ Browser notification when complete
○ Sound alert on completion
○ Email report (requires configuration)

Save these settings as default: [✓]

[Save Configuration] [Reset to Defaults] [Cancel]
```

#### Test Suite Selector ℹ️
**Tooltip:** "Choose which collection of tests to run"

**Modal Content:**
```
📚 Test Suite Selection

TEST SUITE TYPES:

🏢 CORE AGENTS (15 tests)
Predefined tests covering essential behaviors for all main agents.
Recommended for: Regular regression testing

Includes:
• GENERATE agent (5 tests): Letter creation scenarios
• REFINE agent (3 tests): Note update logic
• SUGGEST agent (3 tests): Improvement proposals
• DETECT_TONE agent (2 tests): Tone detection
• IMAGE agent (2 tests): Image request handling

🔧 AGENT-SPECIFIC SUITES
Run tests for just one agent type.
Recommended for: Targeted testing after changing one agent

Available:
• GENERATE Only (5 tests)
• REFINE Only (3 tests)
• SUGGEST Only (3 tests)
• [etc for each agent]

📁 CUSTOM SUITES
Your created test collections.
Recommended for: Feature-specific or project-specific testing

Create custom suites:
1. Select tests from any category
2. Click "Create Suite"
3. Name and save for reuse

🌍 ALL TESTS (25 tests)
Every predefined and custom test.
Recommended for: Comprehensive testing before major releases

⚠️ Warning: May take 10-15 minutes to complete

[Create Custom Suite] [Close]
```

#### Progress Bar ℹ️
**Tooltip:** "Real-time test execution progress"

**Modal Content:**
```
📊 Understanding Test Progress

PROGRESS INDICATOR:
████████░░░░░░ 8 / 15 tests (53%)

• Filled bars: Completed tests
• Empty bars: Remaining tests
• Green tint: All tests passing so far
• Red marker: Failed test location

TIME ESTIMATES:
⏱ Elapsed: 2m 14s
⏱ Remaining: ~3m 06s (estimated)

Estimates based on:
• Average time per test so far this run
• Historical data for these tests
• Current execution speed

TIME FACTORS:
• Model response times vary
• Network conditions affect speed
• Complex tests take longer
• Parallel execution speeds up total time

PROGRESS STATES:
• ⏸ Pending: Not started yet
• ↻ Running: Currently executing
• ✓ Passed: Test succeeded
• ✗ Failed: Test did not meet expectations
• ⚠ Warning: Passed but with concerns (e.g., high latency)

TIP: Click [⏸ Pause] to pause between tests if you need
to inspect results mid-run.

[Close]
```

#### Test Failure Details ℹ️
**Tooltip:** "Detailed analysis of why test failed"

**Modal Content:**
```
🔍 Test Failure Analysis

TEST: Style mimicry with example
AGENT: GENERATE
STATUS: ❌ FAILED (2 of 3 assertions)

PASSING ASSERTIONS:
✓ Generated output present
  Verified output was returned and non-empty

FAILING ASSERTIONS:

❌ Assertion 1: Contains style markers
Expected: Formal greeting and closing
Actual: Missing formal greeting
Location: N/A - greeting not found in output

Analysis:
The system instruction may not emphasize style matching
strongly enough. The model generated content but didn't
preserve the formal style from the example.

❌ Assertion 2: Excludes casual language
Expected: No casual words like "hey", "cool", "awesome"
Actual: Found "hey" at line 1
Location: "Hey there, I wanted to reach..."

Analysis:
Agent used casual greeting despite "Professional" tone
and formal style example. This suggests:
• System instruction tone guidance needs strengthening
• Model may require explicit negative examples
• Custom instruction conflict possibility

TEST INPUT:
{
  "tone": "Professional",
  "styleExample": "Dear Colleague, I write to inform...",
  "roughNotes": "- Request meeting\n- Discuss project"
}

EXPECTED OUTPUT EXCERPT:
Should start: "Dear [Name]," or "Good morning,"
Should end: "Sincerely," or "Best regards,"
Should avoid: Casual language

ACTUAL OUTPUT:
"Hey there, I wanted to reach out about scheduling
a meeting to discuss the project..."

RECOMMENDATIONS:
1. Review GENERATE agent system instruction
2. Add explicit examples of professional greetings
3. Test with different model to compare
4. Consider adding negative examples to training

QUICK ACTIONS:
[View Full Output] [Edit System Instruction] [Re-run with Changes]
[Create Comparison Test] [Report Issue] [Close]
```

#### Report Export ℹ️
**Tooltip:** "Generate detailed test report"

**Modal Content:**
```
📄 Export Test Report

Generate a comprehensive report of this test run for documentation,
sharing with team, or archiving.

REPORT FORMATS:

📊 HTML (Recommended)
Styled, interactive web page with:
• Executive summary dashboard
• Expandable test details
• Charts and visualizations
• Shareable via link or file
• No dependencies required

Best for: Sharing with team, presentations

📝 Markdown
Plain text with formatting:
• Readable in any text editor
• Version control friendly
• Easy to embed in docs
• Lightweight and portable

Best for: Documentation, GitHub issues

📈 CSV
Spreadsheet format with:
• One row per test
• Columns: test name, status, latency, assertions
• Importable to Excel/Sheets
• Good for data analysis

Best for: Performance tracking, metrics

📦 JSON
Raw structured data:
• Complete test details
• Machine-readable
• API integration friendly
• Full output included

Best for: Automation, archiving, re-importing

REPORT CONTENTS:
☑ Test results (pass/fail/warnings)
☑ Execution times and performance metrics
☑ Agent and model information
☑ Assertion details
☑ Comparison to baseline (if available)
☐ Full input/output data (minimal by default)
☐ Screenshots (if captured)
☐ Observation notes

Include timestamp in filename: [✓]
Open after export: [✓]

[Generate Report] [Advanced Options] [Cancel]
```

#### Save as Baseline ℹ️
**Tooltip:** "Store this run as reference for future comparisons"

**Modal Content:**
```
💾 Save Baseline

A baseline is a reference point for future test runs. Use it to
detect regressions and track changes over time.

WHAT GETS SAVED:
• Test results (pass/fail status)
• Performance metrics (latency, tokens)
• Agent configurations
• Model versions used
• Timestamp and metadata

HOW BASELINES WORK:

1. Save Baseline
   Current test run becomes reference point

2. Future Runs
   System compares new results to baseline
   
3. Regression Detection
   Highlights:
   • Tests that used to pass but now fail (CRITICAL)
   • Tests that got slower (PERFORMANCE)
   • Tests with different output patterns (WARNING)

BASELINE NAMING:
○ Auto-generate name: "baseline-2026-03-13-14-35"
○ Custom name: [___________________________]

BASELINE RETENTION:
Keep last [5] baselines
Older baselines automatically archived

BEST PRACTICES:
• Save baseline after verifying all tests pass
• Create baseline before major changes
• Use descriptive names ("pre-refactor", "v2.0-release")
• Compare regularly to catch drift

EXAMPLE WORKFLOW:
1. Fix all test failures
2. Verify 100% pass rate
3. Save as "stable-baseline"
4. Make agent changes
5. Run tests again
6. Compare to "stable-baseline"
7. Investigate any new failures

[Save Baseline] [Manage Baselines] [Cancel]
```

#### Compare to Baseline ℹ️
**Tooltip:** "See how current run differs from saved baseline"

**Modal Content:**
```
📊 Baseline Comparison

Compare current test run to a saved baseline to identify
regressions and changes in behavior.

SELECT BASELINE:
[Dropdown list of saved baselines]
• stable-baseline (2026-03-10) - All passed
• pre-refactor (2026-03-08) - 14/15 passed
• v1.0-release (2026-03-01) - All passed

[Select: stable-baseline]

COMPARISON VIEW:

REGRESSION ALERTS: 🚨
Tests that passed in baseline but now fail:

❌ GENERATE - Style mimicry
   Baseline: ✓ Passed (312ms)
   Current:  ✗ Failed (425ms)
   Issue: New assertion failures introduced

PERFORMANCE CHANGES: ⚠️
Tests with significant latency changes:

⚠ REFINE - Add new information
   Baseline: 189ms
   Current:  276ms (+46%)
   Impact: Slower but within acceptable range

✓ SUGGEST - Ambiguity detection
   Baseline: 345ms
   Current:  289ms (-16%)
   Impact: Performance improvement!

NEW TESTS: ℹ️
Tests not present in baseline:

🆕 IMAGE - Complex scene request
   Current: ✓ Passed (1,234ms)
   Note: Added after baseline created

SUMMARY:
• Regressions: 1 (critical)
• Performance degradations: 1 (warning)
• Performance improvements: 1
• New tests: 1
• Overall pass rate change: 100% → 83% ⬇

RECOMMENDATIONS:
1. Investigate style mimicry regression immediately
2. Monitor REFINE performance in production
3. Update baseline after fixing issues

[View Detailed Comparison] [Export Comparison Report]
[Switch Baseline] [Close]
```

---

## Enhanced Global Help System

### Help Modal (❓ Icon in top-right)

**Modal Content:**
```
❓ Agent Eval Suite Help

QUICK START GUIDES:
→ Getting Started (5 min tutorial)
→ Your First Test (step-by-step)
→ Understanding Results
→ Writing Good Assertions

MODE-SPECIFIC HELP:
→ Comparison Mode Guide
→ Playground Mode Guide
→ Batch Runner Guide

CONCEPTS:
→ What are Agents?
→ System Instructions Explained
→ Assertions and Validation
→ Performance Metrics

TROUBLESHOOTING:
→ Tests Keep Failing - Common Causes
→ Slow Test Execution
→ Unexpected Outputs
→ API Connection Issues

VIDEO TUTORIALS:
→ Overview (3 min)
→ Testing Workflow (8 min)
→ Advanced Techniques (12 min)

KEYBOARD SHORTCUTS:
Ctrl/Cmd + Enter    Run current test
Ctrl/Cmd + S        Save scenario/workflow
Ctrl/Cmd + E        Export results
Esc                 Close modals
Tab                 Navigate modes

SUPPORT:
→ View Documentation
→ Report a Bug
→ Request a Feature
→ Contact Support

[Search Help Topics...]

[Close]
```

---

## Empty State Guidance

### First-Time User Experience

When a user first opens any mode with no tests run:

**Comparison Mode Empty State:**
```
┌─────────────────────────────────────────────────┐
│              👋 Welcome to Comparison Mode!     │
│                                                 │
│  Quick validation and testing in 3 easy steps:  │
│                                                 │
│  1️⃣ Select a predefined test from the sidebar │
│     or create your own                          │
│                                                 │
│  2️⃣ Review the test configuration and press    │
│     [▶ Run Test]                                │
│                                                 │
│  3️⃣ Compare expected vs actual results         │
│                                                 │
│  [Try Example Test] [Watch Tutorial] [Skip]    │
└─────────────────────────────────────────────────┘
```

**Playground Mode Empty State:**
```
┌─────────────────────────────────────────────────┐
│            🎮 Welcome to Playground Mode!       │
│                                                 │
│  Explore agent workflows interactively:         │
│                                                 │
│  • Build agent chains step-by-step              │
│  • Execute and observe each stage               │
│  • Fork workflows to test variations            │
│  • Document your findings                       │
│                                                 │
│  [Load Example Workflow] [Start Fresh]          │
│            [Watch Tutorial]                     │
└─────────────────────────────────────────────────┘
```

**Batch Runner Empty State:**
```
┌─────────────────────────────────────────────────┐
│           📊 Welcome to Batch Runner Mode!      │
│                                                 │
│  Run comprehensive test suites automatically:   │
│                                                 │
│  ✓ Validate all agents at once                 │
│  ✓ Catch regressions before deployment         │
│  ✓ Generate detailed reports                   │
│  ✓ Track performance over time                 │
│                                                 │
│  Recommended: Start with "Core Agents" suite    │
│  (15 tests, ~5 minutes)                         │
│                                                 │
│  [Run Core Agents] [Configure First] [Help]    │
└─────────────────────────────────────────────────┘
```

---

## Contextual Help Tooltips

### General Tooltip Guidelines

All tooltips should:
- Appear on hover after 500ms delay
- Use clear, concise language (1-2 sentences max)
- Provide just-in-time information
- Link to full documentation for complex features
- Use consistent icons (ℹ️ for info, ❓ for help, ⚠️ for warnings)

### Progressive Disclosure

Information is layered by depth:

**Layer 1: Tooltip (Hover)**
- Quick hint, 1-2 sentences
- Example: "Choose which agent to test"

**Layer 2: Modal (Click ℹ️)**
- Detailed explanation with examples
- Includes "Why it matters" and "How to use"
- Links to related concepts

**Layer 3: Documentation (Link from Modal)**
- Comprehensive guide
- Multiple examples and edge cases
- Best practices and troubleshooting

---

## Visual Design Enhancements

### Information Icon Styling

```css
.info-icon {
  /* Standard info icon appearance */
  color: var(--info-blue);
  cursor: help;
  font-size: 0.9em;
  margin-left: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.info-icon:hover {
  opacity: 1;
}

/* Info icon types */
.info-icon--warning {
  color: var(--warning-amber);
}

.info-icon--error {
  color: var(--error-red);
}
```

### Modal Styling

```css
.help-modal {
  /* Modal container */
  max-width: 600px;
  background: var(--surface-elevated);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 2rem;
}

.help-modal__header {
  /* Modal title with icon */
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.help-modal__content {
  /* Scrollable content area */
  max-height: 60vh;
  overflow-y: auto;
  line-height: 1.6;
}

.help-modal__section {
  /* Content sections within modal */
  margin-bottom: 1.5rem;
}

.help-modal__section-title {
  /* Section headers */
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.help-modal__actions {
  /* Modal footer buttons */
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-subtle);
}
```

---

## Accessibility Enhancements

### Screen Reader Support

All information icons and modals must:
- Have proper ARIA labels
- Announce modal title when opened
- Support keyboard navigation (Tab, Esc)
- Focus management (return focus on close)

```html
<!-- Example markup -->
<button 
  class="info-icon"
  aria-label="More information about agent selection"
  data-tooltip="Choose which agent to test">
  ℹ️
</button>

<div 
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-content"
  class="help-modal">
  <h2 id="modal-title">Agent Selection</h2>
  <div id="modal-content">...</div>
</div>
```

### Keyboard Navigation

- `Tab` / `Shift+Tab`: Navigate between focusable elements
- `Enter` / `Space`: Open info modal
- `Esc`: Close modal
- `?`: Open main help panel (global)

---

This enhanced design specification ensures every user, regardless of experience level, can understand and effectively use the Agent Eval Suite.
