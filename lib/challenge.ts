export interface ChallengeQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  link: string;
  source?: string;
  image?: string;
  imageAttribution?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
  imageSource?: string;
  imageView?: {
    x: number;
    y: number;
    width: number;
    height: number;
    sourceWidth: number;
    sourceHeight: number;
  };
  recognition?: string[];
  confusion?: string;
}
export function shuffled<T>(values: readonly T[], random = Math.random): T[] {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export function prepareRound<T extends ChallengeQuestion>(
  questions: readonly T[],
  limit = 10,
): T[] {
  return shuffled(questions)
    .slice(0, limit)
    .map((q) => {
      const correct = q.options[q.answer];
      const options = shuffled(q.options);
      return { ...q, options, answer: options.indexOf(correct) };
    });
}
