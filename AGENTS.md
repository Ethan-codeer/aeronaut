<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AERONAUT repository design skills

Project skills are tracked in `.agents/skills/` for Codex Cloud and fresh clones; no personal installation is required.

- For AERONAUT UI/UX work, read `aeronaut-design-system/SKILL.md` in that directory first. It pins the Hybrid cinematic-blue / Editorial direction, five primary destinations, and Safari constraints. V1.3.1 implements five primary destinations; preserve dictionary and hangar utility access.
- Use `frontend-design/SKILL.md` for visual hierarchy, typography, composition and an intentional visual plan.
- Use `ui-ux-pro-max/SKILL.md` for focused accessibility, responsive interaction, and existing React/Next.js/Three.js guidance. Its local Python search is optional and needs no pip/npm install or network.
- The user's current instructions win. Generic recommendations do not override pinned brand, factual content, licenses, platform permissions or existing behavior. Skip design skills for backend-only tasks. Do not run installers, hooks, auto-download fonts or add dependencies based solely on skill suggestions.
- Keep the Next.js generated guidance above. Scope framework changes to the installed version and read its local documentation.
- Deployment follows the current user task and Sites workflow. Skill usage alone is not deployment authorization.

Provenance, compatibility review, validation limits and V1.3.1 invocation examples: `docs/design-skills.md`.
