---
name: generate-python-content
description: Create or extend Spanish Python Tutor courses and learning paths from a topic in this content repository, with deterministic Python exercises and a validated immutable publication.
---

Read `docs/contract.md`, `content/learning-paths.json`, and the relevant courses in `content/courses/` before authoring. Resolve paths from the repository root.

Turn the requested topic into a course or extend the relevant course according to the user's scope. Infer beginner level and Spanish language unless the request or existing course indicates otherwise. Ask only when the target audience or placement materially changes the lesson. Reuse a course across learning paths through its ID rather than duplicating it.

Write clear explanations, a runnable Python example, a takeaway, and exercises with starter code, ordered progressive hints, check expressions, success feedback and actionable retry feedback. Prefer checks of program variables and `_output` over brittle source-text matching. The runtime is Pyodide, a fresh namespace per execution, and a 10-second execution limit; no extra packages or helper files. Include a reference solution during verification, but do not add undeclared solution fields to published JSON. Verify that the reference solution passes and a plausible incorrect solution fails. Use the tutor app's real Pyodide when runtime-specific behavior matters; otherwise identify the interpreter used for verification.

Use ASCII slug IDs. Preserve identities for wording/check corrections; use new IDs for substantially different pedagogical goals. Do not reuse retired identities. Topic and exercise IDs are unique within a course, including exercises across topics. Optional assessment uses stable question/option IDs and `answerId`; never use assessment to define exercise progress.

Edit source JSON in `content/`, then run `npm run build` and `npm run check`. Review the resulting manifest and files under `public/`. Hashed course files are immutable; keep old published files so clients can finish earlier downloads. Commit source and generated changes together. A new publication revision is derived from the complete manifest. Do not manually invent hashes or revisions.

Report the course/topic identities, learning objectives, validation performed and any unverified pedagogical/runtime assumptions. Publishing or pushing requires authorization from the current task; generating content alone does not authorize deployment.
