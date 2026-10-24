import { Box3, MathUtils, PerspectiveCamera, Vector3 } from "three";
/** Fit the actual airframe bounds for the chosen camera direction and aspect. */
export function frameAirframe(
  camera: PerspectiveCamera,
  bounds: Box3,
  target: Vector3,
  margin = 1.1,
) {
  const direction = camera.position.clone().sub(target).normalize();
  const right = new Vector3().crossVectors(camera.up, direction).normalize();
  const up = new Vector3().crossVectors(direction, right).normalize();
  const tanV = Math.tan(MathUtils.degToRad(camera.getEffectiveFOV() / 2)),
    tanH = tanV * Math.max(0.05, camera.aspect);
  let distance = camera.near * 4;
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z]) {
        const point = new Vector3(x, y, z).sub(target),
          near = point.dot(direction);
        distance = Math.max(
          distance,
          near + (margin * Math.abs(point.dot(right))) / tanH,
          near + (margin * Math.abs(point.dot(up))) / tanV,
        );
      }
  camera.position.copy(target).addScaledVector(direction, distance);
  camera.lookAt(target);
  return distance;
}
