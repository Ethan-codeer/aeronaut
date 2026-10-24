import tailChallenges from "./tail-challenges.json";
import { getLivery } from "./liveries";
import { airlines } from "./airlines";
import type { ChallengeQuestion } from "@/lib/challenge";
import type { Difficulty } from "./questions";
export type AirlineMode = "code" | "geography" | "livery" | "logo";
export interface AirlineQuestion extends ChallengeQuestion {
  type: AirlineMode;
  difficulty: Difficulty;
  airlineSlug: string;
  verifiedAt: string;
  visualVariant?: "full" | "detail";
  imageReviewed?: boolean;
  imageAnswerLeakRisk?: "low" | "high" | "uncertain";
}
function choices(correct: string, other: string[]) {
  return [
    correct,
    ...[...new Set(other)].filter((v) => v !== correct).slice(0, 3),
  ];
}
const textQuestions: AirlineQuestion[] = airlines.flatMap((a, i) => {
  const common = {
    airlineSlug: a.slug,
    verifiedAt: a.verifiedAt,
    link: `/world/airlines/${a.slug}`,
  };
  const names = airlines
    .slice(i + 1)
    .concat(airlines.slice(0, i))
    .map((b) => b.nameZh);
  const geographyIsHQ = i % 2 === 1;
  const correctPlace = geographyIsHQ ? a.headquarters : a.country;
  return [
    {
      ...common,
      id: `air-iata-${a.iata}`,
      type: "code",
      difficulty: "入门",
      question: `IATA 二字代码 ${a.iata} 对应哪家航空公司？`,
      options: choices(a.nameZh, names),
      answer: 0,
      explanation: `${a.nameZh}（${a.nameEn}）的 IATA 二字代码是 ${a.iata}，ICAO 三字代码是 ${a.icao}。航司代码不同于机场代码。`,
      source: a.sources[0].url,
    },
    {
      ...common,
      id: `air-icao-${a.icao}`,
      type: "code",
      difficulty: "进阶",
      question: `${a.nameZh}的 ICAO 三字代码是什么？`,
      options: choices(
        a.icao,
        airlines.filter((b) => b.slug !== a.slug).map((b) => b.icao),
      ),
      answer: 0,
      explanation: `${a.nameZh}的 ICAO 三字代码是 ${a.icao}，而 IATA 二字代码是 ${a.iata}。两者使用场景不同。`,
      source: a.sources[0].url,
    },
    {
      ...common,
      id: `air-geo-${a.slug}`,
      type: "geography",
      difficulty: "入门",
      question: geographyIsHQ
        ? `${a.nameZh}的总部或公司主要办公地点对应哪一项？`
        : `${a.nameZh}来自哪个国家或地区？`,
      options: choices(
        correctPlace,
        airlines.map((b) => (geographyIsHQ ? b.headquarters : b.country)),
      ),
      answer: 0,
      explanation: `${a.nameZh}（${a.nameEn}）来自${a.country}，总部位于${a.headquarters}。这是总部所在地资料，并不等同于它的全部枢纽或航点。`,
      source:
        a.sources.find((s) => /总部|简介|历史/.test(s.label))?.url ??
        a.sources[0].url,
    },
  ] as AirlineQuestion[];
});
const logoQuestions: AirlineQuestion[] = airlines
  .filter((a) => a.logo)
  .flatMap((a) => {
    const media = a.logo!;
    const common = {
      id: `air-logo-${a.slug}`,
      type: "logo" as const,
      difficulty: "入门" as const,
      airlineSlug: a.slug,
      verifiedAt: a.verifiedAt,
      visualVariant: "full" as const,
      question: "这个完整标志属于哪家航空公司？",
      options: choices(
        a.nameZh,
        airlines.filter((b) => b.slug !== a.slug).map((b) => b.nameZh),
      ),
      answer: 0,
      explanation: `这是${a.nameZh}的标志。完整标志模式保留真实字标；局部模式只展示图形的一部分。标志仅用于知识识别，商标权归相应权利人。`,
      link: `/world/airlines/${a.slug}`,
      image: media.file,
      imageSource: media.source,
      imageLicense: media.license,
      imageAttribution: "标志权利人见答题后的来源",
      imageReviewed: true,
      imageAnswerLeakRisk: "low" as const,
    };
    // The view is a display window on the unaltered, licensed original SVG.
    const dimensions =
      a.slug === "ana"
        ? {
            x: 202,
            y: 0,
            width: 98,
            height: 78,
            sourceWidth: 300,
            sourceHeight: 78,
          }
        : a.slug === "air-france"
          ? {
              x: 167,
              y: 0,
              width: 22,
              height: 18,
              sourceWidth: 189,
              sourceHeight: 18,
            }
          : {
              x: 0,
              y: 0,
              width: 154,
              height: 154,
              sourceWidth: 1000,
              sourceHeight: 154,
            };
    return [
      common,
      {
        ...common,
        id: `air-logo-detail-${a.slug}`,
        difficulty: "进阶" as const,
        visualVariant: "detail" as const,
        question: "这个标志的局部图形属于哪家航空公司？",
        imageView: dimensions,
      },
    ];
  });
const delta = airlines.find((a) => a.slug === "delta")!;
const emirates = airlines.find((a) => a.slug === "emirates")!;
const liveryQuestions: AirlineQuestion[] = [
  {
    id: "air-paint-12",
    type: "livery",
    difficulty: "进阶",
    airlineSlug: delta.slug,
    verifiedAt: "2026-10-22",
    question: "观察红蓝几何图形，这种机尾涂装属于哪家航司？",
    options: ["达美航空", "美国联合航空", "法国航空", "英国航空"],
    answer: 0,
    explanation:
      "这是达美航空的红蓝机尾涂装，使用与 Widget 三角形视觉语言呼应的图案。照片摄于 2010 年，供历史涂装识别；不代表实时机队。",
    link: "/world/airlines/delta",
    image: "/images/challenges/a-1d7f40.jpg",
    imageSource: delta.livery!.source,
    imageLicense: delta.livery!.license,
    imageLicenseUrl: delta.livery!.licenseUrl,
    imageAttribution: delta.livery!.attribution,
    imageReviewed: true,
    imageAnswerLeakRisk: "low",
  },
  {
    id: "air-paint-27",
    type: "livery",
    difficulty: "进阶",
    airlineSlug: emirates.slug,
    verifiedAt: "2026-10-22",
    question: "观察这个机尾的配色与斜向图案，它属于哪家航司？",
    options: ["阿联酋航空", "卡塔尔航空", "国泰航空", "澳洲航空"],
    answer: 0,
    explanation:
      "这是阿联酋航空的机尾：以阿联酋国旗色组成醒目的斜向配色。本题只提供已审核的机尾显示范围，未显示机身航司名称。照片为历史涂装资料。",
    link: "/world/airlines/emirates",
    image: "/images/challenges/a-708dc1.jpg",
    imageView: {
      x: 1320,
      y: 45,
      width: 300,
      height: 430,
      sourceWidth: 1920,
      sourceHeight: 1280,
    },
    imageSource:
      "https://commons.wikimedia.org/wiki/File:Boeing_777-300ER,_Geneva_Airport,_Le_Grand-Saconnex_(BL7C0540).jpg",
    imageLicense: "CC BY-SA 4.0",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    imageAttribution: "Matti Blume",
    imageReviewed: true,
    imageAnswerLeakRisk: "low",
  },
];
const additionalTailQuestions: AirlineQuestion[] = tailChallenges.map(
  (record) => {
    const livery = getLivery(record.liverySlug)!;
    const airline = airlines.find((a) => a.slug === livery.airlineSlug)!;
    const media = livery.media!;
    return {
      id: record.id,
      type: "livery",
      difficulty: "进阶",
      airlineSlug: airline.slug,
      verifiedAt: "2026-10-24",
      question: "观察这个机尾的图形与配色，它属于哪家航空公司？",
      options: choices(
        airline.nameZh,
        airlines.filter((a) => a.slug !== airline.slug).map((a) => a.nameZh),
      ),
      answer: 0,
      explanation: `这是${airline.nameZh}的机尾，照片展示「${livery.name}」。${livery.design}${livery.story} 图片为历史摄影资料，不代表当前机队或涂装状态。`,
      link: `/world/airlines/${airline.slug}`,
      image: record.image,
      imageView: record.imageView,
      imageSource: media.source,
      imageLicense: media.license,
      imageLicenseUrl: media.licenseUrl || undefined,
      imageAttribution: media.attribution,
      imageReviewed: true,
      imageAnswerLeakRisk: "low",
    };
  },
);
export const airlineQuestions: AirlineQuestion[] = [
  ...textQuestions,
  ...logoQuestions,
  ...liveryQuestions,
  ...additionalTailQuestions,
];
