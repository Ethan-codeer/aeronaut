# AERONAUT 资料与授权

整理日期：2026-10-18。本资料库用于航空科普，数值并非飞行操作数据。数据与组件分离，参数来源键位于 `data/aircraft.ts`，每项重要指标在详情页均有链接。

## 飞机参数

- Airbus： https://www.aircraft.airbus.com/en/aircraft ，各子型号链接见数据库。
- Airbus 首飞与历史： https://www.airbus.com/en/about-us/our-history 。
- Boeing 机场规划手册入口： https://www.boeing.com/commercial/airports/plan-manuals ，需选择对应型号手册。
- Boeing 历史档案： https://www.boeing.com/history 。
- Embraer E195-E2： https://www.embraer.com/e-jets-e2/e195e2/en/ 。
- COMAC C919： https://www.comac.cc/cpyzr/c919/ 。

数值来自公开参考资料的人工整理，未建立逐页资料快照或自动更新机制，系列级来源不能视为对每个修订构型的精确认证。专业使用前须核查对应手册修订版及构型。航程为公布参考能力，座位为参考布局，巡航马赫数为典型近似值。

明确缺口：C919 巡航马赫数、767-300ER 子型号首飞日期。A350-900 不包含 ULR，747-8 为 Intercontinental 客运型，767 翼展为没有后装翼梢小翼的构型，C919 5,555 km 指增程型。

## 科学与机场资料

- NASA Glenn — Lift Equation：https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/ 。模型密度固定为标准海平面近似值 1.225 kg/m³。气流 SVG 仅为概念示意，未经 CFD 计算。
- FAA — Pilot’s Handbook of Aeronautical Knowledge：https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak 。
- FAA — Aeronautical Information Manual：https://www.faa.gov/air_traffic/publications/atpubs/aim_html/ 。
- IATA — Airline and Airport Code Search：https://www.iata.org/en/publications/directories/code-search/ 。
- 航空史：Smithsonian National Air and Space Museum、RAF Museum、Boeing/Airbus/COMAC，具体事件在页面逐项列明链接。

## 图片

机器可读完整清单：`data/photo-credits.json`。每项包含真实子型号、作者、来源文件页、许可证 URL 和原始文件 URL。照片由 Wikimedia Commons 提供；使用 CC BY、CC BY-SA 或明确标注的公有领域文件。显示时可能有 CSS 裁切、缩放及深色渐变叠层，照片文件本身未做编辑。各图片仍遵守各自许可，未将整站代码重新许可为图片许可证。

首页：Don-vip 的 A350 首飞照片，CC BY-SA 3.0。航空世界：Alex Cheban 的 A330neo 首飞照片，CC BY-SA 4.0。请保留 `/credits` 署名页和详情页中的作者/来源/许可链接。

A321XLR 使用 AERONAUT 原创示意图。其外形与其他 A321neo 相近，因此没有以无注册信息的照片推断 XLR，也没有将其纳入识别挑战。所有原创 SVG 仅作为教学示意，不能量取工程尺寸。


## V1.2

- 69个词典条目：FAA PHAK / AIM；ETOPS另参照14 CFR §121.161，IATA与ICAO代码入口见每条词典来源。
- 50个机场：OurAirports公有领域数据，由datasets/airport-codes快照选择；精确来源、下载日期、SHA256见docs/v1.2-airport-audit.json。官网HTTP状态见docs/v1.2-airport-websites.json。
- 新增14张涂装摄影全部来自Commons明确CC BY、CC BY-SA或CC0许可，作者、原作、条款及调整记录见docs/v1.2-livery-audit.json；另外6张沿用V1.1授权记录。全图等比缩小和WebP压缩，不删除水印。
- Leaflet1.9.4为BSD-2-Clause；OSM标准瓦片按需加载、保留署名、遵守瓦片政策，不预取离线地图。
- 结构图和仪表均为原创SVG教学示意，不作为工程、维修或认证训练资料。


## V1.3

- 新增七个原创简化教学 GLB 和概念配色：CC0-1.0，生成与渲染源码、范围声明位于 public/models/atlas。原747 GPL许可和对应源码保持不变。
- 机场数据核查范围和来源：docs/v1.3-airport-audit.json。
- 涂装图像来源、摄影许可、署名与下载哈希：docs/v1.3-livery-audit.json。
- 概念配色不是航司真实涂装，未把摄影作品作为完整3D贴图。

机场数据库时区字段参考 OpenFlights（ODbL 1.0）；本项目含该派生时区数据的机场数据库按 ODbL 1.0 提供，数据库源文件见 data/airports.json。来源及许可证：https://github.com/jpatokal/openflights/blob/master/data/airports.dat ，https://opendatacommons.org/licenses/odbl/1-0/ 。OurAirports 代码、坐标与标高本身为公有领域。ODbL 数据库许可不改变照片、3D模型等独立素材的许可。
