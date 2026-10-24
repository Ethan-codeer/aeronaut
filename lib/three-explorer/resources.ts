import * as THREE from "three";
/** Dispose shared GPU resources and ImageBitmaps exactly once per released tree. */
export function releaseObject(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const images = new Set<{ close?: () => void }>();
  root.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
      geometries.add(object.geometry);
      for (const material of Array.isArray(object.material)
        ? object.material
        : [object.material])
        materials.add(material);
    }
  });
  for (const material of materials) {
    for (const value of Object.values(material))
      if (value instanceof THREE.Texture) textures.add(value);
  }
  for (const texture of textures) {
    if (texture.image && typeof texture.image === "object")
      images.add(texture.image);
    texture.dispose();
  }
  for (const image of images)
    if (typeof image.close === "function") image.close();
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}
export function textureMemoryEstimate(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material])
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
  });
  let bytes = 0;
  for (const texture of textures) {
    const image = texture.image;
    if (image?.width && image?.height)
      bytes +=
        image.width * image.height * 4 * (texture.generateMipmaps ? 4 / 3 : 1);
  }
  return Math.ceil(bytes);
}
/** GLTFLoader may recover from an image error; a textured aircraft must not silently lose its maps. */
export function assertModelTextures(root: THREE.Object3D, expected: number) {
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    for (const material of Array.isArray(object.material)
      ? object.material
      : [object.material])
      for (const value of Object.values(material))
        if (value instanceof THREE.Texture) textures.add(value);
  });
  if (
    textures.size !== expected ||
    [...textures].some((t) => !t.image?.width || !t.image?.height)
  )
    throw Error("模型纹理未完整加载，请重试或使用2D展示。");
}
