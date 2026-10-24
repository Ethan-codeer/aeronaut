#!/usr/bin/env python3
"""Offline repository skill integrity check; no installs, network or model turns."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
skills = root / '.agents/skills'
expected = {'aeronaut-design-system', 'frontend-design', 'ui-ux-pro-max'}
found = {p.parent.name for p in skills.glob('*/SKILL.md')}
assert found == expected, (found, expected)
for name in expected:
    path = skills / name / 'SKILL.md'
    text = path.read_text()
    assert text.startswith('---\n') and '\n---\n' in text[4:], name
    header = text.split('---', 2)[1]
    assert f'name: {name}\n' in header and 'description:' in header, name
assert '${CLAUDE_PLUGIN_ROOT}' not in (skills/'ui-ux-pro-max/SKILL.md').read_text()
for name, license_name in [('frontend-design', 'LICENSE.txt'), ('ui-ux-pro-max', 'LICENSE')]:
    assert (skills/name/license_name).is_file(), name
lock = json.loads((root/'docs/design-skills-lock.json').read_text())
for file, digest in lock['installedFiles'].items():
    path = root / file
    assert path.is_file() and not path.is_symlink(), file
    assert hashlib.sha256(path.read_bytes()).hexdigest() == digest, file
print(f'PASS: {len(found)} skills; {len(lock["installedFiles"])} pinned files and license notices readable.')
