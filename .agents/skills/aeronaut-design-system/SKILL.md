---
name: aeronaut-design-system
description: Apply AERONAUT brand, Hybrid UI/UX, five-navigation information architecture, Editorial reading layouts and iPad Safari constraints to V1.3.1 UI design, implementation and review. Use before generic design skills for this project; skip backend-only tasks.
---

# AERONAUT design system

Read this first for AERONAUT UI work. Follow the user's current brief over these defaults; apply this project context before generic recommendations. Read target source and existing tokens before editing. The V1.3.1 implementation uses this direction; verify actual target components before changing them.

## Product and Hybrid direction

AERONAUT — The World of Flight, at Your Fingertips. An aviation education and exploration site. Combine cinematic aviation imagery and deep-blue navigation with calm Editorial reading surfaces and precise interactive tools. Let photography/model content lead galleries; let hierarchy, typography and factual sources lead encyclopedias. Avoid converting every section into identical SaaS cards or applying immersive effects to reading and controls.

Keep Next.js App Router static export, React/TypeScript, Tailwind 4 plus existing CSS, Lucide, motion, Three.js and Leaflet. Preserve ChatGPT Sites hosting identity. Do not migrate platforms, rebuild the site, remove working modules, restore wrong-answer/review systems, or change factual aviation content to fill a layout. Use stable aircraft/airline/airport/dictionary IDs and exact subtypes. Preserve existing routes, local progress and media licensing.

## Brand and tokens

Cinematic deep blue remains the anchor. Reuse semantic variables in app/globals.css. Target palette grounded in existing CSS:
- cinema/nav: #091722 / #0d2335; atmospheric hero: #061b30;
- dark surface: #142939; dark raised: #1a3346;
- reading canvas: #f6f8fa, white paper #ffffff;
- reading ink: #112c40; dark-theme text: #e5eff6;
- interactive accent: #2487c8; dark-theme accent: #65b8ee.

These are seed tokens, not certified contrast pairs: measure each text/background combination. Keep normal text >=4.5:1, large text and meaningful UI graphics >=3:1. Do not assume existing muted text already passes. Preserve light/dark functionality; no hard-coded white text on light paper. Use restrained borders, controlled highlights and ample negative space. Avoid large blur/backdrop-filter layers on A12X, continuous background animation and scroll-jacking.

## Editorial typography and layout

Strong headline, short readable deck, generous whitespace, purposeful image, then structured reading. Prefer left-aligned Chinese paragraphs, approximately 30–40 Chinese characters per line where space permits; English prose roughly 60–75 characters. Body 16–18px, line-height 1.65–1.85. Scale headings with clamp(), never squeeze desktop typography onto phones. All visible typography, including aircraft names, airport codes, numeric data, formulae and the English tagline, uses the original Arial/PingFang SC/Microsoft YaHei/sans-serif stack via --font-ui. Do not reintroduce Georgia, decorative serif numerals or italic display type; the user explicitly requested regular typography on 2026-10-30. Do not auto-download fonts; any new font needs separate licensing and performance checks. Avoid decorative letter spacing on Chinese. Use upright lining numerals; tabular numerals may align comparable technical data. Motion should be restrained: a short page fade, menu entrance and hover/press feedback; honor prefers-reduced-motion, keep SSR content visible, never remount children merely to animate and never gate interaction on an animation finishing. Distinguish airport from terminal, source dates from current operations, concept livery from historical livery.

## Five primary navigation destinations (V1.3.1 target)

1. 探索首页 / — cinematic entry and pathways.
2. 飞机百科 /atlas — aircraft, comparison and model details.
3. 航空挑战 /academy — quizzes, cockpit and tail challenges.
4. 飞行实验室 /lab — anatomy, lift, instruments and 3D Explorer.
5. 航空世界 /world — airports, airlines and liveries.

V1.3.1 components/shell.tsx implements these five destinations. The dictionary lives in a persistent utility entry and contextual links; retain /dictionary and all term URLs. 我的机库 /hangar remains a utility action. Never silently hide dictionary access or delete a route to meet the five-item target. Desktop and iPad must keep the same labels and hierarchy; use a keyboard-accessible collapsed menu when space requires it. Do not force five long labels into a crowded mobile bar.

## iPad Pro A12X / Safari and smaller screens

Check portrait 1024×1366, landscape 1366×1024, intermediate 768px and phone 390×844 (plus 320px overflow sanity check). These sizes are QA targets, not device detection. Prefer content-driven grid/flex wrapping, minmax(0,1fr), safe-area-inset-* and 100vh fallback before 100dvh. No hover-only actions. Tap targets >=44×44 CSS px with spacing; inputs >=16px, visible focus, associated labels, usable VoiceOver names, keyboard traversal and reduced-motion support. Preserve pinch zoom; never disable user scaling. Sticky panels must not obscure focus, headings, Safari bars or the software keyboard.

Keep map drag lock and list fallback; scrolling outside a map or canvas must work. Only the active detail viewer creates WebGL; models load on demand, pause offscreen and release on close, with static image fallback. Reuse geometry when switching supported materials, preserve the camera and do not invent unavailable liveries/animation. Keep DPR capped/adaptive and avoid extra live WebGL scenes or expensive decorative effects. Never claim A12X FPS or Safari touch acceptance from desktop Chromium emulation.

## Workflow and review

Use frontend-design for a compact visual plan aligned to this brief. Use ui-ux-pro-max for focused UX/a11y/React/Next.js/Three.js lookups, not to regenerate the brand. Read existing relevant guides under node_modules/next/dist/docs before framework changes. Implement bounded changes and maintain source attribution and honest data gaps. Check reading hierarchy, filters, empty/loading/error states, focus, contrast, responsive overflow, dictionary access and quiz answer concealment. Run relevant tests and build when code changes; inspect rendered target pages if preview is available. Report checks actually run and separate simulated-browser QA from real Safari testing.

This skill grants no deployment or external messaging authority. Publication follows the user's current task authorization and Sites workflow; do not infer publication authority from using a design skill alone.
