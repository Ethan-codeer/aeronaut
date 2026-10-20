export const AIR_DENSITY = 1.225;
export function calculateLift(
  speed: number,
  area: number,
  coefficient: number,
  density = AIR_DENSITY,
): number {
  if (
    ![speed, area, coefficient, density].every(Number.isFinite) ||
    speed < 0 ||
    area <= 0 ||
    density <= 0
  )
    throw new RangeError("请输入有效的速度、面积、系数与空气密度");
  return 0.5 * density * speed ** 2 * area * coefficient;
}
export function scoreAnswers(answers: { correct: boolean }[]) {
  const correct = answers.filter((a) => a.correct).length;
  return {
    correct,
    total: answers.length,
    accuracy: answers.length ? Math.round((correct / answers.length) * 100) : 0,
  };
}
