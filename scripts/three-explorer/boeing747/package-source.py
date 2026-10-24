# SPDX-License-Identifier: GPL-2.0-only
# Run from project root: python scripts/three-explorer/boeing747/package-source.py SOURCE_REPOSITORY
from pathlib import Path
import sys,zipfile
base=Path(sys.argv[1]);out=Path('public/models/boeing747')
files={base/'Models'/name:'Models/'+name for name in ['747-8.ac','747-8i_gear.ac','fuselage.png','wings.png','747-8.xml','747-8i_gear.xml']}
files[base/'README']='UPSTREAM-AUTHORS.txt';files[base/'LICENSE']='LICENSE.txt';files[out/'NOTICE.txt']='MODIFICATIONS.txt'
for p in Path('scripts/three-explorer/boeing747').glob('*'):
 if p.is_file() and p.suffix in ['.py','.mjs']:files[p]='scripts/'+p.name
readme='''AERONAUT 747-8 corresponding source (GPL-2.0-only)

See LICENSE.txt, UPSTREAM-AUTHORS.txt and MODIFICATIONS.txt.
Native source: JMaverick16/747-8 commit 0ed6056990828084bd51770e3ad73d0b61a1ad61.
The engine/gear/tyre image files referenced by native AC3D are not needed:
textures.py creates original neutral replacements. No unverified original engine
photo or GE logo is included. Fuselage/wing images retain upstream GPL terms.

Requires Blender 4.3.2 (bundled NumPy) and Node.js >=22.
Run from this directory:
blender -b --python scripts/convert.py -- Models build/high 2
blender -b --python scripts/convert.py -- Models build/balanced 1
npm install @gltf-transform/core@4.2.1 @gltf-transform/extensions@4.5.1 @gltf-transform/functions@4.2.1 meshoptimizer@0.22.0 sharp@0.35.5 gltf-validator@2.0.0-dev.3.10
mkdir -p docs/three-explorer/boeing747
node scripts/optimize.mjs build/high build/balanced

These steps regenerate GLBs, texture atlases, editable intermediate BLEND files
and renders. Meshopt/quantization decoders are local, not CDN-dependent.
No triangle padding or duplicated airframes are used. CPU render images do not
establish GPU FPS. The website source repository contains the separate runtime,
Three.js viewer, tests and integration instructions.
'''
with zipfile.ZipFile(out/'corresponding-source.zip','w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p,name in files.items():z.write(p,name)
 z.writestr('README.txt',readme)
print('Corresponding source bytes:',(out/'corresponding-source.zip').stat().st_size)
