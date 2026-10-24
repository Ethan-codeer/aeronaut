# AERONAUT Boeing 747-8 integration

The retained `/lab/3d-explorer` now displays a real community-authored Boeing 747-8 Intercontinental exterior. It is not the generic twinjet relabelled. No manufacturer accuracy certification or aircraft/airline endorsement is claimed.

## Model, provenance and licensing

Source: [JMaverick16/747-8](https://github.com/JMaverick16/747-8), pinned to `0ed6056990828084bd51770e3ad73d0b61a1ad61`.

The upstream README attributes the 747-8i v2 to John Williams; wings, engines and original -8i work to Grupo FGBr (Aurino das Neves, Isaias Prestes, Rick Britto, Wagner Silva); and earlier cockpit/gear/texture work to Gijs de Rooy, Ivan Ngeow, Jentron, Syd Adams, Torsten Dreyer and Markus Bulik. The README expressly releases it under GPL 2.0 and includes the full license. Native geometry can be modified and publicly redistributed under those terms.

The page retains attribution, a link to the upstream model, full GPL terms, modification notices and a same-origin download of the complete corresponding model source. The archive contains native AC3D geometry, licensed fuselage/wing images, original attribution/license, and the actual editable conversion, texture-generation and optimization scripts. It does not include unrelated FlightGear systems or unverified engine photographs. The model/derivative poster remain GPL-2.0-only; the independent website is a separate work.

No real-airline livery was selected: suitable airline-brand usage conditions could not be established. The model has neutral white paint. Fuselage/wing artwork retains upstream GPL terms; engine, strut and tyre artwork was recreated without the original engine photo or GE logo. No manufacturer or airline trademark license is claimed. This is an educational depiction with simplified details, not CAD or maintenance documentation.

Search also covered Sketchfab's Zihan Chi 747, Blend Swap's cobe571 747 Intercontinental and PV 747-400, CGTrader, and other GitHub repositories. Some candidate downloads were blocked/unavailable; their actual assets could not be verified. Generic CGTrader royalty-free conditions restrict separately retrievable models, making them unsuitable for an exposed browser GLB without further permission. No restricted viewer resources were extracted.

## Final assets

| Variant              | Triangles | GLB bytes | Mesh draw primitives | Materials | Textures |
| -------------------- | --------: | --------: | -------------------: | --------: | -------: |
| High                 |   148,911 | 1,574,384 |                   20 |         6 |        2 |
| Balanced / efficient |    67,095 | 1,019,408 |                   20 |         6 |        2 |

Both assets use one airframe and the same textures: an embedded 2048×2048 PNG exterior atlas and a 512×512 PNG auxiliary atlas. Native fuselage (2048×1024) and wing (1024×1024) detail is preserved in the main atlas; small auxiliary maps are not artificially enlarged. No external image requests or decoder CDN are needed. Raw RGBA8 texture allocation with mipmaps is approximately 22.7 MiB, excluding driver/browser overhead; it is not measured VRAM.

The conversion retains the extended upper deck, four separate engine component groups, raked wingtips, conventional tail and five gear assemblies. It removes hidden cabin/effects, refines curved surfaces with pinned boundaries, reduces the high variant with UV boundaries, removes 43 degenerate triangles per variant, batches by aircraft component and applies 16-bit position/UV Meshopt quantization. There are no duplicated airframes or triangle-count padding. Khronos validation of the decoded output has zero errors, warnings or informational findings. File size below the suggested 5–12 MB is a compression result, not missing external textures.

KTX2 was not added: the two PNG atlases total about 421 KB compressed, and preserving a simple locally decoded Safari-compatible path was preferable before real-device measurements. This leaves raw texture memory as a limitation compared with GPU-compressed formats.

## Viewer and debug changes

- Existing Three.js architecture, route, controls and 2D fallback remain. Actual-model bounds fit the overview/top cameras across narrow and wide viewports; nose/wing/engine presets target the 747.
- Default: balanced 67k geometry, DPR up to 1.5. Efficient uses the same geometry at DPR up to 1; high loads the 149k model at DPR up to 2. Pixel/hardware ceilings can reduce actual resolution. High requests high-performance GPU preference; other normal profiles retain low-power preference.
- Switching geometry releases the old renderer/model and mounts a fresh canvas. Reusing a force-lost canvas caused a real Chromium failure during QA and was fixed before publication.
- Explicit auto rotation is available; idle rendering remains demand-driven. Continuous metric updates are throttled. Offscreen/background rendering pauses.
- Byte length and SHA-256 are checked; missing texture maps fail rather than silently showing an untextured model. Transport/WebGL failures retain the 747 poster and retry controls.
- Shared geometry, materials, textures and ImageBitmaps are disposed, including cancellation during parsing and errors. The generic twinjet is not requested during normal 747 browsing; its assets remain available for the prior debug comparisons.
- The opt-in performance panel now offers both real textured 747 variants and the five retained generic stress levels. Its reports distinguish these assets. New 747 results also report the >=55 average / >=45 1% Low / >=55 final-10-second target. All older progress and debug-storage keys remain compatible; no wrong-answer collection was added.

## Validation and limits

Type checking, ESLint, 98 tests in 18 files, and production static build pass. Automated checks include actual Three.GLTFLoader + Meshopt decoding and PNG pixel decoding, four-engine identity and model bounds, both LODs, texture counts, camera framing, normal/debug lifecycle, load failure, partial-parse cancellation, resource disposal, UI controls and preservation of existing features.

Blender independently imports the decoded high GLB with both atlases and renders it. These CPU renders verify appearance, not browser FPS. Browser QA uses the environment's installed Chromium with SwiftShader software rendering. The browser checks passed: actual GLB/PNG loading, all views, zoom/drag, auto rotation, both geometry levels, injected network failure with 2D recovery/retry, tablet drag/pinch emulation, and a 390px layout. The actual high renderer reported 21 calls including the grid, 2 textures, and DPR2 at 2480×1120. Its report/screenshots and current deployment receipt are in `/workspace/artifacts`; it is not A12X/Safari or a hardware-performance acceptance test.

The three completed 20-second high-LOD/DPR2 software-rendered trials measured: static 12.49 average / 5.29 low; rotation 11.88 / 5.45; view switching 8.86 / 2.35 FPS. These low SwiftShader results are recorded honestly and do not predict A12X hardware performance; the hardware FPS target remains unaccepted. They are also not thermal tests.

Real 2018 A12X iPad Pro Safari touch, loading time, average FPS, 1% Low, sustained thermal behavior, power and VRAM remain unmeasured here. The user-provided generic 49,378-triangle / 25-call / zero-texture / DPR2 / 60-average / 43.3-low baseline does not establish performance of this textured 747. No A12X pass is prefilled or asserted.

For device testing: choose the actual 747 high variant and DPR2 in developer performance mode, run all three scenarios at 20 seconds, then repeat promising settings at 180/300 seconds with manual initial/final warmth notes. Compare final ten seconds and 1% Low. A browser cannot diagnose chip temperature or thermal throttling directly. Switch to the 67k variant or a lower DPR if measured results require it.

## Reproduction and recovery

Use `scripts/three-explorer/boeing747/convert.py`, `textures.py`, `ac3d.py`, `optimize.mjs`, and `package-source.py`. Dependencies are declared in package.json; Blender 4.3.2/NumPy performs the offline conversion. `check-export.mjs` verifies page, lazy loading and exact HTTP assets.

Before this task, Sites source/live version was 6 at `8b71e16789e1546a07841737957e73d4c9861b3b`; recovery bundle: `/workspace/backups/aeronaut-before-747.bundle`. GitHub main was the known ancestor `46c89de874359a9b8b9547750e5d02e486ed3ca2`; normal fast-forward synchronization preserves the already-published V1.1/V1.2/3D history. Both remote heads are rechecked before pushing; no forced updates, host migration, new Site or domain changes are used.
