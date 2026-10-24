import { liveries, getLiveryOrganization } from "@/data/liveries";
import { PageHeading } from "@/components/ui";
import photoCredits from "@/data/photo-credits.json";
import { airlines } from "@/data/airlines";
import { spotterQuestions } from "@/data/spotter";
import { airlineQuestions } from "@/data/airline-questions";
import { aircraft } from "@/data/aircraft";
export const metadata = { title: "资料来源与图片署名" };
export default function Credits() {
  return (
    <div className="container page-content">
      <section className="paper-panel reading-panel">
        <h2>V1.3 模型与涂装授权</h2>
        <p>
          七个新增机型为 AERONAUT 原创简化教学模型与 Concept Livery，按 CC0-1.0
          提供；源代码与离线渲染脚本随模型公开。模型不是厂商工程资料，也不表示航司运营历史。747-8I
          继续采用 FlightGear 的 GPL-2.0-only
          模型，保留原署名、许可证与对应源码。
        </p>
        <div className="related-links">
          <a href="/models/atlas/LICENSE.txt">原创模型许可 ↗</a>
          <a href="/models/atlas/model-source.mjs">模型源码 ↗</a>
          <a href="/models/boeing747/AUTHORS.txt">747 作者 ↗</a>
          <a href="/models/boeing747/corresponding-source.zip">
            GPL 对应源码 ↗
          </a>
        </div>
        <p>
          机场代码与坐标来自 OurAirports 公有领域数据；IANA 时区参考 OpenFlights
          的 ODbL 开放数据库。含该派生时区数据的数据库按 ODbL
          提供，百科原始来源与核查范围另列于各机场页面。
          <a href="https://opendatacommons.org/licenses/odbl/1-0/">
            ODbL 1.0 条款
          </a>{" "}
          ·{" "}
          <a href="https://raw.githubusercontent.com/Ethan-codeer/aeronaut/main/data/airports.json">
            下载可机读机场数据库
          </a>
        </p>
        <h3>涂装图像逐件署名</h3>
        {liveries
          .filter((l) => l.media)
          .map((l) => (
            <p key={l.slug}>
              <a href={`/world/liveries/${l.slug}`}>
                {getLiveryOrganization(l)} · {l.name}
              </a>{" "}
              — © {l.media!.attribution} ·{" "}
              <a href={l.media!.licenseUrl || l.media!.source}>
                {l.media!.license}
              </a>{" "}
              · <a href={l.media!.source}>原作与来源 ↗</a>
            </p>
          ))}
      </section>
      <section className="paper-panel reading-panel">
        <h2>V1.2 新增资料与授权</h2>
        <p>
          词典、结构及仪表教学参考 FAA PHAK / AIM；ETOPS另参照14 CFR
          §121.161。机场坐标、代码及标高来自OurAirports公有领域数据；OpenStreetMap底图按需加载，保留署名，不预取或缓存离线瓦片。
        </p>
        <p>
          新增照片采用Commons文件页明确的CC BY或CC
          BY-SA许可。每件涂装档案列出作者、原作和条款。全图显示，未删除水印；优化版本只等比缩小与压缩。商标和角色权利仍归相应权利人。
        </p>
        <div className="related-links">
          <a href="https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak">
            FAA PHAK ↗
          </a>
          <a href="https://ourairports.com/data/">OurAirports与许可 ↗</a>
          <a href="https://operations.osmfoundation.org/policies/tiles/">
            OpenStreetMap瓦片政策 ↗
          </a>
        </div>
      </section>
      <PageHeading
        eyebrow="SOURCES & CREDITS / 资料与署名"
        title="每一次探索，都有据可循。"
        description="感谢分享知识与影像的制造商、研究机构和摄影者。以下列出本版本采用的内容来源及授权信息。"
      />
      <div className="paper-panel">
        <h2>航空资料</h2>
        <p>
          飞机尺寸、航程、座位及动力系统参考制造商产品资料与机场规划手册。首飞资料参考制造商历史档案；百科详情逐项提供来源链接。航程和座位数有构型限制，马赫数为典型参考值，不是运行保证值。
        </p>
        <div className="source-links">
          {[...new Set(aircraft.map((a) => a.sources.engine))].map((url) => (
            <a key={url} href={url} target="_blank" rel="noreferrer">
              {url} ↗
            </a>
          ))}
        </div>
        <p>
          升力实验参考{" "}
          <a
            className="inline-link"
            href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/"
            target="_blank"
            rel="noreferrer"
          >
            NASA Glenn Research Center / The Lift Equation
          </a>
          。机场知识参考 FAA 航空信息手册与 IATA
          官方代码目录。部分资料入口为型号或系列级文档，不代表每一组参数都来自同一修订版；本版本尚未建立逐页快照的编辑审校系统。
        </p>
        <div className="notice">
          资料缺口：C919 公开巡航马赫数、767-300ER
          子型号首飞日期尚待可靠资料核实，页面明确显示“待核实”。制造商参数会随升级变化；后续将加入资料修订日期、页码与构型版本。
        </div>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">IMAGE ATTRIBUTION</span>
            <h2>摄影与图片授权</h2>
            <p>
              图片已下载到本项目。页面可能做显示裁切、缩放和渐变叠色，未修改原始照片文件。
            </p>
          </div>
        </div>
        <div className="table-wrap">
          <table className="credits-table">
            <thead>
              <tr>
                <th>机型</th>
                <th>作者</th>
                <th>授权</th>
                <th>原始文件</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(photoCredits).map(([slug, p]) => (
                <tr key={slug}>
                  <th>{aircraft.find((a) => a.slug === slug)?.model}</th>
                  <td>{p.author}</td>
                  <td>
                    {p.licenseUrl ? (
                      <a
                        className="inline-link"
                        href={p.licenseUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {p.license} ↗
                      </a>
                    ) : (
                      p.license
                    )}
                  </td>
                  <td>
                    <a
                      className="inline-link"
                      href={p.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Wikimedia Commons ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">
          首页主视觉：Don-vip · A350 First Flight - Low pass 02 · CC BY-SA
          3.0。航空世界主视觉：Alex Cheban · Airbus A330neo first take-off
          (cropped) · CC BY-SA
          4.0。具体机型图片的源页面与授权条款也在百科中提供。
        </p>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">V1.1 / RESEARCH & MEDIA</span>
            <h2>航司资料与挑战素材</h2>
            <p>
              航司代码参考 IATA
              名录；总部、历史、联盟及机队参考各航司和联盟的官方资料。每个航司档案列出具体来源及日期。南航机队另参考
              Planespotters 二手资料；Qantas 部分官方链接在本执行环境返回
              503，已在档案注明。
            </p>
          </div>
        </div>
        <div className="source-links">
          {airlines.map((a) => (
            <a key={a.slug} href={`/world/airlines/${a.slug}`}>
              {a.nameZh} · 资料核对 {a.verifiedAt} ↗
            </a>
          ))}
        </div>
        <div className="table-wrap">
          <table className="credits-table">
            <thead>
              <tr>
                <th>素材</th>
                <th>作者 / 权利人</th>
                <th>许可</th>
                <th>来源</th>
              </tr>
            </thead>
            <tbody>
              {[
                ...new Map(
                  [
                    ...spotterQuestions.map((q) => ({
                      file: q.image!,
                      source: q.imageSource,
                      license: q.imageLicense,
                      attribution: q.imageAttribution,
                    })),
                    ...airlineQuestions
                      .filter((q) => q.image)
                      .map((q) => ({
                        file: q.image!,
                        source: q.imageSource!,
                        license: q.imageLicense!,
                        attribution: q.imageAttribution!,
                      })),
                    ...airlines.flatMap((a) =>
                      [a.logo, a.livery].filter((m) => m !== null),
                    ),
                  ].map((m) => [m.source, m]),
                ).values(),
              ].map((m) => (
                <tr key={m.source}>
                  <td>V1.1 摄影 / 标志</td>
                  <td>{m.attribution}</td>
                  <td>{m.license}</td>
                  <td>
                    <a
                      className="inline-link"
                      href={m.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      原作与许可 ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">
          识别题采用中性文件名，答题前不显示机型标题或源文件链接。挑战 JPEG
          副本仅清除可能泄题的描述元数据，未重绘、模糊或改变飞机结构；完整授权记录保留在题库和答后来源中。局部题仅改变显示窗口。图片审核为助手逐张视觉核对，未代替独立人工复核；不确定素材不出题。
        </p>
      </section>
      <div className="paper-panel">
        <h2>原创素材</h2>
        <p>
          AERONAUT 飞机示意图、升力示意与界面图形为项目原创
          SVG，不是工程图，不主张具有测量精度或型号鉴定效力。Lucide 图标遵循 ISC
          License。摄影中的商标和涂装仍属于相应权利人，不表示其认可本项目。
        </p>
      </div>
    </div>
  );
}
