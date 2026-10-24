/** Derived from the original AERONAUT CC0 parametric twinjet; generator MIT.
 * Higher quality re-tessellates actual curved surfaces. No aircraft duplication.
 */
import * as THREE from "three";
import { Document } from "@gltf-transform/core";
import { weld, dedup, prune } from "@gltf-transform/functions";
export function predictedTriangles(quality) {
  const s = (b) => Math.max(3, Math.round(b * quality));
  return (
    492 +
    22 * s(64) +
    32 * s(48) +
    8 * s(40) +
    4 * s(24) +
    68 * 2 * s(8) * (s(6) - 1) +
    6 * 2 * s(10) * (s(6) - 1) +
    12 * s(10) * s(24) +
    24 * s(16) +
    12 * s(12)
  );
}
export function qualityForTarget(target) {
  let lo = 1,
    hi = 9,
    best = 1;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (
      Math.abs(predictedTriangles(mid) - target) <
      Math.abs(predictedTriangles(best) - target)
    )
      best = mid;
    if (predictedTriangles(mid) < target) lo = mid;
    else hi = mid;
  }
  return best;
}
export async function buildDebugTwinjet(quality) {
  const seg = (b) => Math.max(3, Math.round(b * quality));
  const doc = new Document();
  Object.assign(doc.getRoot().getAsset(), {
    version: "2.0",
    generator: "AERONAUT original parametric twinjet generator",
    copyright: "AERONAUT project; mesh dedicated under CC0-1.0",
  });
  const buffer = doc.createBuffer();
  const scene = doc.createScene("GenericTwinjet");
  const materials = {
    white: doc
      .createMaterial("PearlWhite")
      .setBaseColorFactor([0.88, 0.91, 0.94, 1])
      .setRoughnessFactor(0.48),
    wing: doc
      .createMaterial("WingGrey")
      .setBaseColorFactor([0.61, 0.7, 0.77, 1])
      .setRoughnessFactor(0.65),
    blue: doc
      .createMaterial("AeronautBlue")
      .setBaseColorFactor([0.035, 0.2, 0.37, 1])
      .setRoughnessFactor(0.5),
    glass: doc
      .createMaterial("Glazing")
      .setBaseColorFactor([0.018, 0.055, 0.085, 1])
      .setMetallicFactor(0.15)
      .setRoughnessFactor(0.27),
    dark: doc
      .createMaterial("FanAndTyres")
      .setBaseColorFactor([0.025, 0.033, 0.041, 1])
      .setRoughnessFactor(0.8),
    metal: doc
      .createMaterial("StrutsAndHub")
      .setBaseColorFactor([0.36, 0.43, 0.48, 1])
      .setMetallicFactor(0.65)
      .setRoughnessFactor(0.4),
  };
  const parts = new Map();
  function add(
    part,
    material,
    geometry,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
  ) {
    // Enforce outward winding on closed meshes, including mirrored wing planforms.
    const pos = geometry.getAttribute("position"),
      index = geometry.getIndex();
    let volume = 0;
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const a = new THREE.Vector3().fromBufferAttribute(pos, index.getX(i)),
          b = new THREE.Vector3().fromBufferAttribute(pos, index.getX(i + 1)),
          c = new THREE.Vector3().fromBufferAttribute(pos, index.getX(i + 2));
        volume += a.dot(b.cross(c)) / 6;
      }
      if (volume < 0) {
        for (let i = 0; i < index.count; i += 3) {
          const b = index.getX(i + 1);
          index.setX(i + 1, index.getX(i + 2));
          index.setX(i + 2, b);
        }
        geometry.computeVertexNormals();
      }
    }
    const normals = geometry.getAttribute("normal");
    for (let i = 0; i < normals.count; i++) {
      const n = new THREE.Vector3().fromBufferAttribute(normals, i);
      if (n.lengthSq() < 1e-12) n.set(0, 0, pos.getZ(i) < 0 ? -1 : 1);
      else n.normalize();
      normals.setXYZ(i, n.x, n.y, n.z);
    }
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(...scale),
    );
    geometry.applyMatrix4(m);
    const g = geometry.index ? geometry.toNonIndexed() : geometry;
    const key = part + "|" + material;
    const bucket = parts.get(key) || [];
    bucket.push(g);
    parts.set(key, bucket);
  }
  function loft(profile, segments = 48) {
    segments = seg(segments);
    const p = [],
      idx = [];
    for (const [z, r] of profile)
      for (let j = 0; j <= segments; j++) {
        const a = (j / segments) * Math.PI * 2;
        p.push(Math.cos(a) * r, Math.sin(a) * r, z);
      }
    for (let i = 0; i < profile.length - 1; i++)
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j,
          b = a + segments + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  function slab(points, thickness) {
    const p = [],
      idx = [];
    for (const dy of [-thickness / 2, thickness / 2])
      for (const [x, y, z] of points) p.push(x, y + dy, z);
    const n = points.length;
    for (let j = 1; j < n - 1; j++) {
      idx.push(0, j + 1, j, n, n + j, n + j + 1);
    }
    for (let j = 0; j < n; j++) {
      const k = (j + 1) % n;
      idx.push(j, k, n + j, k, n + k, n + j);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  // +Z nose, +Y up; nominal 39m length, 35m span. Conceptual, no OEM geometry.
  add(
    "Fuselage",
    "white",
    loft(
      [
        [-19, 0],
        [-18.3, 0.22],
        [-17, 0.65],
        [-15.2, 1.24],
        [-13, 1.73],
        [-11, 1.95],
        [13, 1.95],
        [15.5, 1.8],
        [17.5, 1.35],
        [18.6, 0.7],
        [19.4, 0.17],
        [19.6, 0],
      ],
      64,
    ),
    [0, 3.6, 0],
  );
  for (const side of [-1, 1]) {
    const name = side === 1 ? "Left" : "Right";
    add(
      "Wing" + name,
      "wing",
      slab(
        [
          [side * 1.35, 2.85, 4.5],
          [side * 17.5, 3.65, -5.2],
          [side * 17.1, 3.68, -7],
          [side * 1.35, 2.85, -3.8],
        ],
        0.22,
      ),
    );
    add(
      "Wing" + name,
      "blue",
      slab(
        [
          [side * 17.1, 3.7, -7],
          [side * 17.5, 3.7, -5.2],
          [side * 17.8, 5.1, -5.8],
          [side * 17.65, 5.2, -6.65],
        ],
        0.08,
      ),
    );
    add(
      "HorizontalTail" + name,
      "wing",
      slab(
        [
          [side * 0.65, 4.1, -12.5],
          [side * 6.9, 4.6, -16.3],
          [side * 6.6, 4.6, -18],
          [side * 0.65, 4.1, -16],
        ],
        0.16,
      ),
    );
    // Engine inlet lies ahead of the local leading edge; nacelle below the wing.
    const engine = [side * 6.2, 1.9, 2.6];
    add(
      "Engine" + name,
      "white",
      loft(
        [
          [-2, 0.57],
          [-1.5, 0.84],
          [0.3, 1.03],
          [1.75, 1.01],
          [1.9, 0.91],
          [1.75, 0.84],
          [0.5, 0.73],
          [-1.5, 0.48],
          [-2, 0.57],
        ],
        48,
      ),
      engine,
    );
    add(
      "Engine" + name,
      "dark",
      new THREE.CylinderGeometry(0.79, 0.79, 0.045, seg(40)),
      [engine[0], engine[1], engine[2] + 1.13],
      [Math.PI / 2, 0, 0],
    );
    add(
      "Engine" + name,
      "metal",
      new THREE.ConeGeometry(0.23, 0.48, seg(24)),
      [engine[0], engine[1], engine[2] + 1.37],
      [Math.PI / 2, 0, 0],
    );
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      add(
        "Engine" + name,
        "metal",
        new THREE.BoxGeometry(0.075, 0.53, 0.025),
        [
          engine[0] + Math.sin(angle) * 0.47,
          engine[1] + Math.cos(angle) * 0.47,
          engine[2] + 1.17,
        ],
        [0, 0, -angle - 0.32],
      );
    }
    add("Engine" + name, "wing", new THREE.BoxGeometry(0.24, 1.1, 2.0), [
      engine[0],
      2.87,
      1.1,
    ]);
    // Cabin windows share one draw batch, rather than one draw call per window.
    for (let i = 0; i < 34; i++)
      add(
        "CabinWindows",
        "glass",
        new THREE.SphereGeometry(1, seg(8), seg(6)),
        [side * 1.833, 4.33, 12.6 - i * 0.68],
        [0, 0, 0],
        [0.055, 0.165, 0.105],
      );
    // Windshield panels sit on the forward upper fuselage, without brand text.
    for (let k = 0; k < 3; k++) {
      const z = 16.1 + k * 0.43;
      const radius = 1.8 - (z - 15.5) * 0.225;
      const a = 0.53 + k * 0.13;
      add(
        "Cockpit",
        "glass",
        new THREE.SphereGeometry(1, seg(10), seg(6)),
        [side * Math.cos(a) * radius, 3.6 + Math.sin(a) * radius, z],
        [0, 0, side * a],
        [0.055, 0.2, 0.25],
      );
    }
  }
  // Vertical fin, solid symmetric wedge. Conventional tail; no fictional interior.

  // Build an x-thickness fin explicitly to keep its actual vertical orientation.
  const fpos = [
    -0.12, 4.1, -12.9, -0.12, 10.5, -16.4, -0.12, 10.6, -18.1, -0.12, 4.1,
    -18.4, 0.12, 4.1, -12.9, 0.12, 10.5, -16.4, 0.12, 10.6, -18.1, 0.12, 4.1,
    -18.4,
  ];
  const fg = new THREE.BufferGeometry();
  fg.setAttribute("position", new THREE.Float32BufferAttribute(fpos, 3));
  fg.setIndex([
    0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 4, 1, 5, 4, 1, 2, 5, 2, 6, 5, 2,
    3, 6, 3, 7, 6, 3, 0, 7, 0, 4, 7,
  ]);
  fg.computeVertexNormals();
  add("VerticalTail", "blue", fg);
  for (const [part, x, z, r] of [
    ["NoseGear", 0, 12.0, 0.31],
    ["MainGearRight", -2.55, -2.6, 0.48],
    ["MainGearLeft", 2.55, -2.6, 0.48],
  ]) {
    add(part, "metal", new THREE.CylinderGeometry(0.09, 0.115, 1.55, seg(12)), [
      x,
      r + 0.68,
      z,
    ]);
    for (const sign of [-1, 1]) {
      add(
        part,
        "dark",
        new THREE.TorusGeometry(r * 0.73, r * 0.27, seg(10), seg(24)),
        [x + sign * 0.22, r, z],
        [0, Math.PI / 2, 0],
      );
      add(
        part,
        "metal",
        new THREE.CylinderGeometry(r * 0.49, r * 0.49, 0.12, seg(16)),
        [x + sign * 0.22, r, z],
        [0, 0, Math.PI / 2],
      );
    }
  }
  const groupNodes = new Map();
  for (const [key, geometries] of parts) {
    const [part, mat] = key.split("|");
    let node = groupNodes.get(part);
    if (!node) {
      node = doc.createNode(part).setExtras({
        partId: part,
        teachingUse: "Exterior conceptual geometry only",
      });
      scene.addChild(node);
      groupNodes.set(part, node);
    }
    const arrays = { POSITION: [], NORMAL: [] };
    for (const g of geometries) {
      for (const value of g.attributes.position.array)
        arrays.POSITION.push(value);
      for (const value of g.attributes.normal.array) arrays.NORMAL.push(value);
    }
    const primitive = doc.createPrimitive().setMaterial(materials[mat]);
    for (const [semantic, list] of Object.entries(arrays))
      primitive.setAttribute(
        semantic,
        doc
          .createAccessor()
          .setType("VEC3")
          .setArray(new Float32Array(list))
          .setBuffer(buffer),
      );
    const child = doc
      .createNode(part + "_" + mat)
      .setMesh(doc.createMesh(part + "_" + mat).addPrimitive(primitive));
    node.addChild(child);
  }

  await doc.transform(weld(), dedup(), prune());
  return doc;
}
