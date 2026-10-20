import { PageHeading } from "@/components/ui";
import photoCredits from "@/data/photo-credits.json";
import { aircraft } from "@/data/aircraft";
export const metadata = { title: "资料来源与图片署名" };
export default function Credits() {
  return (
    <div className="container page-content">
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
