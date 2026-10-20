import photoCredits from "./photo-credits.json";
export type AircraftCategory = "窄体客机" | "宽体客机" | "支线客机";
export type SpecKey =
  "length" | "wingspan" | "height" | "range" | "cruise" | "seats";
export interface Aircraft {
  id: string;
  slug: string;
  manufacturer: string;
  model: string;
  category: AircraftCategory;
  intro: string;
  description: string;
  firstFlight: string;
  specs: Record<SpecKey, number | null>;
  engine: string;
  layout: string;
  recognition: string[];
  highlights: string[];
  image: string;
  imageCredit: string;
  imageSource?: string;
  imageLicenseUrl?: string;
  sources: Record<SpecKey | "firstFlight" | "engine", string>;
  note: string;
}
export const specLabels: Record<SpecKey, { label: string; unit: string }> = {
  length: { label: "机身长度", unit: "m" },
  wingspan: { label: "翼展", unit: "m" },
  height: { label: "机身高度", unit: "m" },
  range: { label: "最大公布航程", unit: "km" },
  cruise: { label: "典型巡航马赫数", unit: "Mach" },
  seats: { label: "参考载客量", unit: "人" },
};
const airbus = "https://www.aircraft.airbus.com/en/aircraft";
const boeing = "https://www.boeing.com/commercial/airports/plan-manuals";
const boeingDocs: Record<string, string> = {
  "737 MAX 8":
    "https://www.boeing.com/content/dam/boeing/v2/airports/acaps/737MAX_RevK.pdf",
  "747-8":
    "https://www.boeing.com/content/dam/boeing/v2/airports/acaps/747-8_Rev_E.pdf",
  "777-300ER":
    "https://www.boeing.com/content/dam/boeing/v2/airports/acaps/777-200LR-300ER-F_Rev_G.pdf",
  "787-9":
    "https://www.boeing.com/content/dam/boeing/v2/airports/acaps/787_ACAP_Rev_Q.pdf",
  "767-300ER":
    "https://www.boeing.com/content/dam/boeing/v2/airports/acaps/767_REV_K.pdf",
};
const rows: [
  string,
  string,
  AircraftCategory,
  string,
  string,
  string,
  number,
  number,
  number,
  number,
  number | null,
  number,
  string,
  string,
  string[],
  string[],
  string,
][] = [
  [
    "Airbus",
    "A320neo",
    "窄体客机",
    "高效进化，重新定义短途飞行。",
    "A320neo 在 A320 平台上引入新一代发动机和 Sharklets 翼梢装置，服务高频短中程航线。neo 即 new engine option。",
    "2014-09-25",
    37.57,
    35.8,
    11.76,
    6300,
    0.78,
    150,
    "CFM LEAP-1A 或 Pratt & Whitney PW1100G-JM",
    "典型两舱 150–180 座",
    [
      "单通道机身，双发下单翼",
      "Sharklets 翼梢与较大的发动机短舱",
      "四轮主起落架（两组双轮）",
    ],
    ["新一代高涵道比发动机", "电传飞行控制系统"],
    airbus + "/a320-family/a320neo",
  ],
  [
    "Airbus",
    "A321XLR",
    "窄体客机",
    "以单通道机身，连接更远的世界。",
    "A321XLR 是 A321neo 的超远程版本，配备后中央油箱，拓展长距离、相对低客流航线。外形与 A321neo 接近，仅凭照片不宜断定 XLR。",
    "2022-06-15",
    44.51,
    35.8,
    11.76,
    8700,
    0.78,
    206,
    "CFM LEAP-1A 或 Pratt & Whitney PW1100G-JM",
    "典型两舱 206–220 座",
    [
      "A320 家族的加长机身",
      "与 A321neo 外形相近",
      "XLR 需结合注册号或型号资料确认",
    ],
    ["后中央油箱 RCT", "公布航程达 4,700 海里"],
    airbus + "/a320-family/a321xlr",
  ],
  [
    "Airbus",
    "A330-900",
    "宽体客机",
    "成熟宽体平台的新一代远航者。",
    "A330-900 属于 A330neo 家族，在 A330 基础上使用新发动机、优化机翼和新翼梢，适合中长程航线。",
    "2017-10-19",
    63.69,
    64,
    16.79,
    13600,
    0.82,
    287,
    "Rolls-Royce Trent 7000",
    "典型三舱约 287 座",
    ["双发宽体机身", "弯曲上翘的新型翼梢", "每侧主起落架四轮"],
    ["Trent 7000 发动机", "Airspace 客舱"],
    airbus + "/a330/a330-900?ref=aeronaut",
  ],
  [
    "Airbus",
    "A350-900",
    "宽体客机",
    "为远方而生，让飞行更进一步。",
    "A350-900 是 A350 家族的基础型号，复合材料机体与新一代发动机共同服务长程飞行。标准型与 ULR 型航程不可混用。",
    "2013-06-14",
    66.8,
    64.75,
    17.05,
    15750,
    0.85,
    332,
    "Rolls-Royce Trent XWB-84",
    "典型三舱 332–352 座",
    [
      "标志性黑色驾驶舱风挡轮廓",
      "平滑弯曲的上翘翼梢",
      "每侧主起落架四轮（-900）",
    ],
    ["大量碳纤维复合材料", "新一代 Trent XWB 发动机"],
    airbus + "/a350/a350-900?ref=aeronaut",
  ],
  [
    "Airbus",
    "A380-800",
    "宽体客机",
    "双层天空，航空工程的宏大想象。",
    "A380-800 是全长双层客舱的四发宽体客机。巨大的客舱与机翼为大型枢纽间的高客流航线而设计。",
    "2005-04-27",
    72.72,
    79.75,
    24.09,
    14800,
    0.85,
    545,
    "Rolls-Royce Trent 900 或 Engine Alliance GP7200",
    "典型四舱约 545 座；最大认证 853 座",
    ["全长双层客舱", "四台发动机", "宽大的机翼和双层舷窗"],
    ["全长双层客舱", "复杂的多轮起落架系统"],
    airbus + "/a380",
  ],
  [
    "Boeing",
    "737 MAX 8",
    "窄体客机",
    "熟悉轮廓里的新一代技术。",
    "737 MAX 8 是 737 MAX 家族中的主力型号，使用 LEAP-1B 发动机和先进技术翼梢。具体航司布局差异较大。",
    "2016-01-29",
    39.52,
    35.9,
    12.3,
    6480,
    0.79,
    162,
    "CFM LEAP-1B",
    "典型两舱 162–178 座",
    ["上下分叉的翼梢装置", "发动机短舱后缘锯齿", "低矮的 737 机身姿态"],
    ["先进技术翼梢", "LEAP-1B 发动机"],
    boeing,
  ],
  [
    "Boeing",
    "747-8",
    "宽体客机",
    "天空女王，最后一代传奇。",
    "这里的数据对应客运型 747-8 Intercontinental，而不是 747-8F 货机。加长的上层客舱与四台发动机延续了 747 的经典轮廓。",
    "2011-03-20（客运型）",
    76.25,
    68.4,
    19.36,
    14320,
    0.855,
    410,
    "GE GEnx-2B",
    "典型三舱约 410 座",
    ["机身前段的上层客舱隆起", "四台发动机", "后掠延伸式翼尖"],
    ["GEnx-2B 发动机", "优化机翼与加长机身"],
    boeing,
  ],
  [
    "Boeing",
    "777-300ER",
    "宽体客机",
    "跨越洲际的双发旗舰。",
    "777-300ER 以加长机身、GE90 发动机与远程能力，成为洲际枢纽航线的常见机型。ER 指 Extended Range。",
    "2003-02-24",
    73.86,
    64.8,
    18.5,
    13649,
    0.84,
    396,
    "GE GE90-115B",
    "典型两舱约 396 座",
    ["巨大直径的 GE90 发动机", "每侧主起落架六轮", "修长机身与后掠延伸翼尖"],
    ["GE90-115B 发动机", "远程双发宽体布局"],
    boeing,
  ],
  [
    "Boeing",
    "787-9",
    "宽体客机",
    "梦的延伸，连接每一段远方。",
    "787-9 是 787 家族的加长成员，以复合材料机体、更多电气化系统和大尺寸舷窗著称。",
    "2013-09-17",
    62.81,
    60.12,
    17.02,
    14010,
    0.85,
    296,
    "GE GEnx-1B 或 Rolls-Royce Trent 1000",
    "典型两舱约 296 座",
    ["发动机短舱后缘锯齿", "流畅的高挠度机翼", "较大的可调光舷窗"],
    ["大量复合材料结构", "电致变色舷窗"],
    boeing,
  ],
  [
    "Boeing",
    "767-300ER",
    "宽体客机",
    "经典双通道，连接大西洋的岁月。",
    "767-300ER 是 767 家族的远程加长版本，常见经济舱布局为 2-3-2。部分飞机后装翼梢小翼，不能作为所有 767 的统一特征。",
    "待核实（767-300ER 子型号）",
    54.94,
    47.57,
    15.85,
    11070,
    0.8,
    218,
    "GE CF6-80C2、PW4000 等（依批次）",
    "典型三舱约 218 座",
    [
      "较窄的双通道机身",
      "通常为 2-3-2 经济舱布局",
      "机鼻和驾驶舱沿用经典波音风格",
    ],
    ["双通道中型机身", "远程双发客机的代表之一"],
    boeing,
  ],
  [
    "Embraer",
    "E195-E2",
    "支线客机",
    "小而出众，区域飞行的新可能。",
    "E195-E2 是 E-Jets E2 家族中最大的型号，采用新机翼和齿轮传动涡扇发动机，典型客舱为 2-2 布局。",
    "2017-03-29",
    41.5,
    35.12,
    10.9,
    5556,
    0.78,
    120,
    "Pratt & Whitney PW1900G",
    "典型三舱 120 座；单舱最多 146 座",
    [
      "2-2 客舱，无中间座位",
      "细长机身配大直径发动机",
      "E2 家族的新型高展弦比机翼",
    ],
    ["齿轮传动涡扇发动机", "新一代机翼设计"],
    "https://www.embraer.com/e-jets-e2/e195e2/en/",
  ],
  [
    "COMAC",
    "C919",
    "窄体客机",
    "中国大飞机，迈向更广阔的天空。",
    "C919 是中国商飞研制的单通道干线客机，2023 年开始商业载客运营。航程随标准型和增程型配置不同而变化。",
    "2017-05-05",
    38.9,
    35.8,
    11.95,
    5555,
    null,
    158,
    "CFM LEAP-1C",
    "官方基本型 158–192 座；本表参考 158 座",
    ["双发单通道机身", "上翘翼梢", "风挡周围深色轮廓，需结合其他特征判断"],
    ["超临界机翼", "集成化航电与电传操纵"],
    "https://www.comac.cc/cpyzr/c919/",
  ],
];
export const aircraft: Aircraft[] = rows.map((r, i) => {
  const [
    manufacturer,
    model,
    category,
    intro,
    description,
    firstFlight,
    length,
    wingspan,
    height,
    range,
    cruise,
    seats,
    engine,
    layout,
    recognition,
    highlights,
    url,
  ] = r;
  const sourceUrl = boeingDocs[model] ?? url;
  const slug = model.toLowerCase().replaceAll(" ", "-");
  const photo = (
    photoCredits as Record<
      string,
      {
        image: string;
        author: string;
        license: string;
        source: string;
        licenseUrl: string;
      }
    >
  )[slug];
  return {
    id: `ac-${i + 1}`,
    slug,
    manufacturer,
    model,
    category,
    intro,
    description,
    firstFlight,
    specs: { length, wingspan, height, range, cruise, seats },
    engine,
    layout,
    recognition,
    highlights,
    image: photo?.image ?? `/images/${slug}.svg`,
    imageSource: photo?.source,
    imageLicenseUrl: photo?.licenseUrl,
    imageCredit: photo
      ? `${photo.author} · ${photo.license}`
      : "AERONAUT 原创机型示意图 · 非工程比例图",
    sources: {
      length: sourceUrl,
      wingspan: sourceUrl,
      height: sourceUrl,
      range:
        model === "E195-E2"
          ? "https://www.embraer.com/media/ue1bdfnq/e195-e2-spec-1.pdf"
          : sourceUrl,
      cruise: sourceUrl,
      seats:
        model === "E195-E2"
          ? "https://www.embraer.com/media/ue1bdfnq/e195-e2-spec-1.pdf"
          : sourceUrl,
      engine: sourceUrl,
      firstFlight:
        manufacturer === "Airbus"
          ? "https://www.airbus.com/en/about-us/our-history"
          : manufacturer === "Boeing"
            ? "https://www.boeing.com/history"
            : url,
    },
    note:
      model === "C919"
        ? "航程 5,555 km 为增程型公布值；标准型为 4,075 km。官方公开巡航速度待核实。"
        : model === "767-300ER"
          ? "767-300ER 子型号首飞资料待核实，未用基础型日期替代。翼展为无后装翼梢小翼构型。"
          : model === "A350-900"
            ? "航程为制造商当前公布的标准型最大值；不代表所有已交付飞机，不包含 ULR。"
            : "航程为制造商公布的参考能力，受重量、构型、气象与载荷影响；座位数为参考布局。巡航马赫数为典型近似值。",
  };
});
export function getAircraft(slug: string) {
  return aircraft.find((a) => a.slug === slug);
}
