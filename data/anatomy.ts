export const anatomyParts = [
  {
    id: "wing",
    name: "机翼",
    en: "Wing",
    term: "wing",
    function: "产生主要升力，并承担燃油储存和载荷传递等任务。",
    principle:
      "机翼使周围气流的压力和动量发生变化。总气动力中垂直于相对来流的分量称为升力；升力随空速、密度、面积和升力系数变化。",
    detail: "箭头示意气流经过翼型；上、下表面的气流不必同时到达后缘。",
    link: "/lab",
    label: "进入升力实验室",
  },
  {
    id: "engine",
    name: "发动机",
    en: "Turbofan engine",
    term: "turbofan",
    function: "以风扇和核心气流的动量变化产生推力。",
    principle:
      "气流经进气、压缩、燃烧、涡轮和排气。涡轮驱动压气机与风扇；高涵道比发动机的大量气流绕过核心机。",
    detail: "蓝色为旁通气流，暖色为核心气流；图中各部件和流量仅作概念示意。",
    link: "/dictionary/thrust",
    label: "理解推力",
  },
  {
    id: "horizontal",
    name: "水平尾翼",
    en: "Horizontal tail",
    term: "horizontal-stabilizer",
    function: "提供纵向稳定、配平和俯仰控制。",
    principle:
      "水平安定面及升降舵改变尾部气动力，产生俯仰力矩。典型客机的安定面可调，具体构型各不相同。",
    detail: "平尾位于主翼之后，常带升降舵；不能把尾翼作用简化为始终向下的力。",
    link: "/dictionary/elevator",
    label: "认识升降舵",
  },
  {
    id: "vertical",
    name: "垂直尾翼",
    en: "Vertical tail",
    term: "vertical-stabilizer",
    function: "提供航向稳定，并通过方向舵控制偏航。",
    principle:
      "侧滑会在垂尾上产生气动力；方向舵偏转可改变这种侧向力，形成绕垂直轴的力矩。",
    detail: "垂尾在俯视图中呈窄条，右侧侧视图显示它的真实竖直方向。",
    link: "/dictionary/rudder",
    label: "认识方向舵",
  },
  {
    id: "highlift",
    name: "襟翼与缝翼",
    en: "Flaps & slats",
    term: "flaps",
    function: "改善低速起飞和着陆时的升力特性。",
    principle:
      "后缘襟翼改变弯度，部分类型增加翼面积；前缘缝翼改善高迎角流动、延缓分离。展开一般也会增加阻力。",
    detail:
      "内侧后缘为襟翼、外侧前缘为缝翼。图中为位置示意，非特定机型放出构型。",
    link: "/dictionary/slats",
    label: "认识缝翼",
  },
  {
    id: "aileron",
    name: "副翼",
    en: "Ailerons",
    term: "ailerons",
    function: "通过左右升力差实现横滚控制。",
    principle:
      "典型操作中一侧副翼向上、另一侧向下。左翼升力降低、右翼升力增大时，飞机向左滚转；也会产生阻力差，需要协调控制。",
    detail: "位于机翼外侧后缘；示意箭头表达升力变化，不是来流方向。",
    link: "/dictionary/roll",
    label: "理解横滚",
  },
  {
    id: "gear",
    name: "起落架",
    en: "Landing gear",
    term: "landing-gear",
    function: "地面支承、滑跑、制动，并吸收着陆冲击。",
    principle:
      "典型双发客机采用前起落架和两组主起落架。轮胎、减震支柱与刹车共同工作，主起落架承受大部分重量。",
    detail: "侧视图显示放下状态；俯视图中只用虚线表示机腹下方的位置。",
    link: "/dictionary/mlw",
    label: "理解着陆重量限制",
  },
  {
    id: "body",
    name: "机身与驾驶舱",
    en: "Fuselage & cockpit",
    term: "fuselage",
    function: "容纳乘客、货物和机组，连接飞机主要结构。",
    principle:
      "机身传递载荷，增压客舱承受内外压差。机鼻内的驾驶舱集成操纵与显示设备，机组据此监视飞机状态。",
    detail: "俯视图机头朝上；驾驶舱在机身前端。结构图不按真实工程比例绘制。",
    link: "/lab/instruments",
    label: "探索驾驶舱仪表",
  },
] as const;
