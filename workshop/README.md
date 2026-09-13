# Workshop Materials — Computational Design Cookbook: From Play to Prototype

These are the handouts from the most recent run of the bodystorming workshop (materials dated 31 August – 3 September 2026). The content of each handout is here as Markdown.

| # | Handout | Used when | Markdown |
|---|---|---|---|
| 1 | **Enact**: "What makes something hard to say?" | Enacting the single-role assistant (README Chapter 3) | [enact.md](enact.md) |
| 2 | **Goal Cards and Rough User Notes** | Handed to each team before they enact | [goal-cards.md](goal-cards.md) |
| 3 | **Role Card template, with definitions** | Describing a role: the single assistant after the debrief, then each role after decomposition (README Chapter 4, Steps 1 and 4) | [role-card-template.md](role-card-template.md) |
| 4 | **Role Card worked example**: Cheerful MDes Thesis Feedback Ghostwriter | A filled-in card to show teams what a finished card looks like | [role-card-example-ghostwriter.md](role-card-example-ghostwriter.md) |
| 5 | **Why Agent Design Studio?** ([open the app](https://agentstudio.aroughidea.com/)) | Before teams test a role card as a working prompt (README Chapter 4, Step 2) | [agent-design-studio.md](agent-design-studio.md) |


---

## Running Order (latest session)

This is the sequence from the slide deck that accompanied the latest workshop. The workshop sat between a lecture and homework:

1. **Lecture:** What Are These Systems, and How Do They Work? (Part 2 of 2)
2. **Workshop:** Designing System Behavior. *Bodystorm an Agent.* "You will Enact, Observe, Organize, and Describe."
3. **Homework:** Experiments, Journaling, and Review

Inside the workshop:

| Step | What happens | Material |
|---|---|---|
| Introduction | Why bodystorming works for designing agent behavior (the text opening README Chapter 3) | — |
| Casting | Headcount and line up: improv, likes to write, UX research. Teams of 3–4 at a table, no laptops; about nine teams planned. | [Facilitator Notes](#cast-roles-by-asking-the-room) |
| Ghostwriter Improv | One 10-minute enactment of a single "Letter Writing Assistant". The User reveals a note at minute 5 and a constraint at minute 8. | [enact.md](enact.md), [goal-cards.md](goal-cards.md) |
| Reflection & Debrief | 3 minutes in teams, then volunteer teams, about 3 minutes each, until time runs out: Assistants, then Users, then Observers reading selected Post-its | README Chapter 3, Phase 2 |
| Describe the role | Fill in a Role Card for the single assistant. "They don't need to be perfect, you will iterate on these as you get feedback on behavior." | [role-card-template.md](role-card-template.md), [role-card-example-ghostwriter.md](role-card-example-ghostwriter.md) |
| Test Your Role | Put the Role Card into Agent Studio: every field except the Knowledge Base goes into System Instructions; the Knowledge Base (one page for now) goes into Knowledge. Set up, evaluate, iterate. | [agent-design-studio.md](agent-design-studio.md), [agentstudio.aroughidea.com](https://agentstudio.aroughidea.com/) |
| Design Practice Question | "How will you present the design of your agent?" A presentation of the design decisions, why they were made, and how they were tested. | README Chapter 4, Step 3 |
| Review | Three design artifacts to discuss and critique: Design Intent, System Diagram, Design Quals | README Chapter 4, Step 3 |

The deck's slides use an older Role Card. Use the current [template](role-card-template.md), which adds Engagement Context and Interaction Loop.

**Follow-up exercise: decomposition.** Role decomposition (README Chapter 4, Step 4) comes after this session. Open it by asking each team:

- Did the assistant feel overwhelmed? Or like it was trying to do too many jobs at once? Or like it needed assistants too?
- How might the assistant describe the ideal assistants?
- Would the user wish they had more than one perspective on the letter?
- What different things might they want to compare or think about?

Then run the role decomposition exercise.

---

## Facilitator Notes

The handouts are short on purpose. Most of what makes the enactment work happens in the room, so it's written down here.

### Choose cards the group has lived

Choose Goal Cards that match what the group has actually experienced. The current printed set, Cards A–C, covers things almost everyone has had to do: resign, apologize, complain. [goal-cards.md](goal-cards.md) also keeps three earlier cards (D–F: internal recommendation, public statement, performance feedback). Use those only with groups that have that kind of experience.

### Ground the User in a real memory

The person playing the User doesn't make up a character. The current Goal Cards (A–C) ask them to *think of a time* they needed to do this; the earlier cards (D–F) don't print that prompt, but the same recall applies. The moment doesn't have to be profound. Being late to class, or a job they wanted to leave but didn't, is enough. Leaning into that memory tells them who the letter is for and what happened, so they can answer the Assistant's questions honestly without improvising.

The Rough User Notes support this rather than replace it. The notes sheet says: *"Use these, or something from your own experience. The point being you don't remember everything at once."*

### Cast roles by asking the room

Before forming teams, take a headcount for each question and have people line up:

- **"Who has done improv?"**
- **"Who likes to write?"** These people make good Assistants.
- **"Who has trouble expressing themselves?"** Usually most of the room. These people make good Users, because they really do know the goal but not the words.
- **"Who has done UX research?"** or, where that doesn't fit the group, **"Who likes to watch people?"** These people make good Observers.

### One run, two reveals

The enactment is **a single 10-minute run**. At minute 5 the User "suddenly remembers" **one** note of their choice, from Stage 2 or from their own memory. At minute 8 they introduce the Stage 3 **constraint**. The reveals happen inside the same run, not in separate runs.
