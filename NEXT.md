# Next

Updated: 2026-11-22

## Where it stands

Letterly is a design tutorial and a working multi-agent letter writer, used to teach how to prototype agentic systems by bodystorming an activity first. The site at https://letterly.aroughidea.com/ answers and its heartbeat is green; the last feature work (#20, #21, September 2026) made the Eval Suite test saved instruction edits and redrew the System Diagram with similarity measures and stories, and #23 slowed the heartbeat to every two hours.

## Next step

Make the Writers' Room honest about the Suggestion Matcher and the Line Art Generator: show what each one actually runs (the Line Art Generator's instruction is used as a prompt prefix), and make Reset delete the saved edit instead of saving a copy of the default.

## After that

- Save each agent's model choice, so the Eval Suite can send the model that was chosen.
- Stop the tone step generating twice, and resolve the Suggestions request that asks for a JSON object while its instruction says otherwise.
- Retry the Suggestion Matcher's embedding fallback when the request throws or returns something other than JSON, and update the System Diagram to match.
- Fix the sideways scroll on `/eval` at phone width (the Eval Suite's tab row).
- Letterly Role Cards, Design Quals, and the gaps in the facilitator kit.

## Blocked or waiting

- None.

## Open questions

- This plan was drafted by Claude on 2026-11-22 from the code and its history. Is the next step right?
