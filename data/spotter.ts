import { aircraft } from "./aircraft";
import credits from "./photo-credits.json";
import type { ChallengeQuestion } from "@/lib/challenge";

export type SpotterMode = "standard" | "detail" | "expert";
export interface ImageReview {
  imageReviewed: boolean;
  imageAnswerLeakRisk: "low" | "high" | "uncertain";
  reviewDate: string;
  reviewMethod: "visual-inspection";
  reviewNotes: string;
  imageLicense: string;
  imageSource: string;
  imageAttribution: string;
}
export interface SpotterQuestion
  extends Omit<ChallengeQuestion, keyof ImageReview>, ImageReview {
  mode: SpotterMode;
  aircraftSlug: string;
  answerPrecision: "family" | "variant";
}
// This records visual review, not an OCR-only approval or a claim of human certification.
// Uncertain images never enter the playable pool. Original atlas images stay intact.
const notes: Record<string, [ImageReview["imageAnswerLeakRisk"], string]> = {
  a320neo: ["high", "后机身可读 AIRBUS A320neo，退出题池。"],
  "a330-900": ["high", "前机身大型 A330neo 文字，退出题池。"],
  "a350-900": ["high", "机身、机腹、尾翼均有 A350 文字，退出题池。"],
  "a380-800": ["low", "未见机型文字；四发、全长双层客舱可辨 A380。"],
  "737-max-8": ["high", "后机身可读 BOEING 737 MAX 8，退出题池。"],
  "747-8": ["low", "只见机头，不能辨认 -8；只作 747 家族机头局部题。"],
  "777-300er": ["low", "未见机型文字；后视图只考 777 家族，不考精确子型号。"],
  "787-9": ["high", "后机身有 BOEING 787 与 SKY SUITE 787，退出题池。"],
  "e195-e2": ["uncertain", "机翼下方可见型号数字，飞机主体偏小；待补充素材。"],
  c919: ["high", "尾翼、机头均有 C919 文字，退出题池。"],
  "767-300er": ["low", "未见型号标识；尾部与翼尖不完整，不作为全机标准题。"],
};
export const spotterImageAudit = Object.entries(credits).map(([slug, p]) => ({
  aircraftSlug: slug,
  imageReviewed: notes[slug][0] !== "uncertain",
  imageAnswerLeakRisk: notes[slug][0],
  reviewDate: "2026-10-22",
  reviewMethod: "visual-inspection" as const,
  reviewNotes: notes[slug][1],
  imageLicense: p.license,
  imageSource: p.source,
  imageAttribution: p.author,
}));
function original(
  slug: keyof typeof credits,
  id: string,
  mode: SpotterMode,
  answer: string,
  options: string[],
  recognition: string[],
  confusion: string,
): SpotterQuestion {
  const p = credits[slug];
  return {
    ...spotterImageAudit.find((a) => a.aircraftSlug === slug)!,
    id,
    mode,
    aircraftSlug: slug,
    answerPrecision: "family",
    question:
      mode === "detail"
        ? "观察机头与驾驶舱，它属于哪个飞机家族？"
        : "观察飞机的外形，它属于哪个飞机家族？",
    image: `/images/challenges/${id}.jpg`,
    imageLicenseUrl: p.licenseUrl,
    options,
    answer: options.indexOf(answer),
    recognition,
    confusion,
    explanation:
      recognition.join("；") +
      "。照片只用于家族级识别，不要求仅凭此视角确定子型号。",
    link: `/atlas/${slug}`,
    source: aircraft.find((a) => a.slug === slug)!.sources.engine,
  };
}
export const spotterQuestions: SpotterQuestion[] = [
  original(
    "a380-800",
    "p-6f2c91",
    "standard",
    "Airbus A380",
    ["Airbus A380", "Boeing 747", "Airbus A350", "Boeing 777"],
    ["客舱双层贯穿机身", "四台翼下发动机", "机身截面宽厚"],
    "747 的上层客舱只位于前部，A350 与 777 为双发单层客舱。",
  ),
  original(
    "747-8",
    "p-82a4d0",
    "detail",
    "Boeing 747",
    ["Boeing 747", "Airbus A380", "Boeing 787", "Airbus A320"],
    ["驾驶舱位于上层甲板前端", "上层驾驶舱下仍有宽大的机鼻"],
    "A380 上层甲板贯穿全机；此机头视角无法区分 747-400 与 747-8，不将两者同时列为选项。",
  ),
  {
    ...original(
      "777-300er",
      "p-51c8ab",
      "detail",
      "Boeing 777",
      ["Boeing 777", "Boeing 787", "Airbus A330", "Airbus A380"],
      [
        "双发动机宽体机身",
        "每侧主起落架有六个机轮",
        "尾部视角可见较宽的机身与后掠平尾",
      ],
      "787 与 A330 常见四轮主起落架；A380 为四发。此视角不区分 777-200 与 -300 等子型号。",
    ),
    question: "观察机尾与主起落架，它属于哪个飞机家族？",
  },
  {
    id: "p-4b7e18",
    mode: "standard",
    aircraftSlug: "a350-900",
    answerPrecision: "family",
    image: "/images/challenges/p-4b7e18.jpg",
    imageReviewed: true,
    imageAnswerLeakRisk: "low",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    imageSource:
      "https://commons.wikimedia.org/wiki/File:A7-ALG_Qatar_Airways_Airbus_A350-941_MSN-13.jpg",
    imageAttribution: "Md Shaifuzzaman Ayon",
    reviewDate: "2026-10-22",
    reviewMethod: "visual-inspection",
    reviewNotes:
      "两次逐图视觉核对，未见型号文字；完整外形。按 A350 家族出题，不区分 -900/-1000。",
    question: "观察机头、翼尖与机身，它属于哪个飞机家族？",
    options: ["Airbus A350", "Boeing 787", "Airbus A330", "Boeing 777"],
    answer: 0,
    recognition: [
      "驾驶舱窗周围黑色面罩",
      "向外向上平滑弯曲的翼尖",
      "修长宽体机身与大直径双发动机",
    ],
    confusion:
      "787 机鼻与驾驶舱窗形不同，发动机短舱后缘常见锯齿；A330 的机头与驾驶舱窗形更传统。",
    explanation:
      "这是 Airbus A350 家族。黑色驾驶舱窗框、弧形翼尖与机身比例需要结合观察，不能仅凭涂装或一个特征确认子型号。",
    link: "/atlas/a350-900",
    source:
      "https://www.airbus.com/en/products-services/commercial-aircraft/passenger-aircraft/a350-family",
  },
];
export function playableSpotter(mode: SpotterMode) {
  return spotterQuestions.filter(
    (q) =>
      q.mode === mode &&
      q.imageReviewed &&
      q.imageAnswerLeakRisk === "low" &&
      !!q.imageLicense &&
      !!q.imageSource,
  );
}
