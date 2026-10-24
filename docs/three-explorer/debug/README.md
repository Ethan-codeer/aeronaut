# 3D Explorer — opt-in developer performance mode

Open `/lab/3d-explorer`, expand **开发者性能调试**, then choose **进入性能调试模式**. This is a diagnostic, not a certified training or device benchmark. It is never started by normal browsing.

## Scope and isolation

The normal viewer, normal GLB, encyclopedia, games and user progress remain unchanged. The entry point uses an explicit dynamic import. The debug renderer, Meshopt decoder, stress manifest, assets, sampling and result storage are loaded only after activation. Exiting releases the renderer, controls, geometries and materials; an active trial is saved as incomplete. No existing storage keys are changed.

The debug renderer uses WebGL 2, high-performance preference, ACES tone mapping, no MSAA, no shadows and no textures. Manual DPR choices are 1, 1.25, 1.5 and 2. Hardware limits and an 8-million-pixel guard can reduce actual DPR; both requested and actual values and the actual WebGL drawing-buffer dimensions are reported. These are explicit debug settings, not the normal viewer's automatic profile.

## Single-aircraft stress assets

| Approximate level | Actual triangles | Compressed GLB bytes |
| --- | ---: | ---: |
| 20k | 20,644 | 136,500 |
| 50k | 49,378 | 282,400 |
| 100k | 100,110 | 516,772 |
| 150k | 150,014 | 736,576 |
| 200k | 198,904 | 964,544 |

Each asset contains exactly one airframe, 13 semantic groups, 24 mesh primitives, six materials and zero textures. Offline analytic tessellation changes the precision of curved fuselage, engine, window and tyre surfaces. It does not duplicate aircraft or just subdivide flat triangles. Dimensions, scene layout and materials are held constant. These assets isolate geometry/DPR costs; conclusions do not transfer automatically to textured aircraft, higher draw-call counts, transparency, shadows or animated internals.

The original project-owned generic twinjet and all five derivatives are CC0-1.0; modification and redistribution are allowed. See the included `public/models/three-explorer/debug/LICENSE.txt`. Source is `scripts/three-explorer/debug/model-builder.mjs`; the reproducible generator is `generate-assets.mjs`. Meshoptimizer 0.22.0 is MIT and is bundled locally, with no decoder CDN. Assets use EXT_meshopt_compression and KHR_mesh_quantization. The manifest records SHA-256, precise counts and file sizes. Source and decoded round-trip Khronos validation report zero errors in `asset-validation.json`; tests parse every actual GLB through Three.GLTFLoader and MeshoptDecoder.

## Timing and result definitions

- Live FPS uses the most recent one-second frame-time window; average and 1% Low use the most recent ten seconds (or the available shorter window).
- Average FPS is frame intervals divided by accumulated interval duration, not an arithmetic mean of instantaneous FPS. Intervals crossing the left window boundary are weighted by overlap.
- 1% Low is `1000 / mean(slowest ceil(N * 0.01) frame times in ms)`. At least one sample is used when N is below 100. p95/p99 frame times and the proportion of frame times above 1/45 second are also retained.
- Frame time comes from requestAnimationFrame timestamps, including CPU scheduling and presentation cadence. It is not GPU query timing. A display refresh-rate ceiling also limits observed FPS.
- Every formal trial has two seconds of warmup, excluded from results. Model download and parsing are excluded and reported separately. Reused models retain their most recent load timing; this is not a fresh network benchmark per trial.
- `renderer.info.render` supplies triangles and draw calls; `renderer.info.memory` supplies texture and geometry resource counts. These counts are not an exact VRAM byte measurement.
- Static observation continuously renders during debugging so that it is comparable with the two animated scenarios. The ordinary viewer retains its existing demand-rendering behavior.

The three scenarios are fixed-rate continuous rotation, static observation, and preset changes every second. Test lengths are 20, 60, 180 and 300 seconds. A queue runs all five model levels × three scenarios at the selected DPR, with 15 seconds of paused rendering between trials. Changing viewport/orientation, going into the background, leaving the viewport, cancelling, or losing WebGL context interrupts and marks a trial invalid for recommendations. Settings are locked while a trial is active.

Every started trial, including cancelled/interrupted trials, is stored under the dedicated localStorage key `aeronaut-3d-performance-debug-v1`. Limits are 200 records and two million JSON characters; no older results are silently evicted. Quota/private-mode failures retain results in session memory and offer JSON export. Reports can be copied or manually selected if Clipboard API fails. Clearing debug results never clears normal progress.

Candidate combinations require completed passing trials in all three scenarios for the same user-labelled device, user agent, viewport, render resolution, model revision, Three revision and DPR. Every recorded trial in that group must pass average FPS >=45, 1% Low >=45 and final-ten-second FPS >=45. Short trials remain explicitly labelled as needing warm retests. This rule identifies candidates, not proof of universal 45–60 FPS performance.

## A12X iPad Pro procedure and heat

No real A12X iPad Pro, Safari GPU, temperature, power or device-memory measurements were performed in the execution environment. User agent alone cannot identify A12X reliably. Enter the exact device and Safari version manually; the A12X checkbox starts unchecked.

1. Close other heavy tabs, note battery/charging/low-power state and ambient conditions. Keep the viewport, orientation and stage dimensions fixed for comparisons. A fixed device condition is more useful than comparing different charging states.
2. Start with DPR 1.25 or 1.5, 20-second trials. Repeat the same queue at other DPR choices. Inspect actual resolution rather than assuming requested DPR was used.
3. Retest promising combinations for 180 or 300 seconds in all three scenarios. Repeat after sustained use, then after a real cooldown. Fifteen seconds between trials pauses rendering but does not establish that the device has cooled.
4. Record initial and post-trial warmth manually. Stop/pause if uncomfortable; do not keep running solely to complete a queue.
5. Export the JSON and brief reports. Compare first/final ten-second FPS and ten-second windows, and inspect 1% Low rather than the average alone.

Safari does not expose reliable chip temperature, total process memory, exact VRAM use or a thermal-throttling flag to this page. A drop in FPS can have multiple causes; the report never diagnoses thermal throttling. A model/DPR recommendation for the real baseline device remains pending until these device runs exist.

## Verification and boundaries

The implementation passed TypeScript, ESLint, 91 tests in 17 files and the production static build. Tests include frame statistics, interrupted lifecycle, local storage/error paths, lazy debug activation, DPR controls, actual model decoding and preservation of the original GLB hash. Runtime lifecycle tests use simulated WebGL/RAF and do not prove GPU performance.

`check-export.mjs` verifies the opt-in entry, absence of debug runtime/manifest payloads in initial scripts, and HTTP status/MIME/hash for all five models. The existing route checker and normal 3D export checker cover retained routes/assets. Browser interactions, screenshots, real touch behavior and real-device FPS remain unverified because no browser/device tooling is available here.
