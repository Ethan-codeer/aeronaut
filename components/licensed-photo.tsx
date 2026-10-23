"use client";
import { useState } from "react";
import type { AirlineMedia } from "@/data/airlines";
export function LicensedPhoto({
  media,
  alt,
}: {
  media: AirlineMedia | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (!media)
    return (
      <div className="photo-placeholder">
        <span>照片下载受来源站限流影响，待补充本地图片。</span>
        <span>文字档案与来源链接可继续浏览。</span>
      </div>
    );
  return (
    <figure className="licensed-image">
      {failed ? (
        <div className="photo-placeholder" role="status">
          <span>照片暂时无法加载</span>
          <button
            onClick={() => {
              setFailed(false);
              setLoaded(false);
              setAttempt((a) => a + 1);
            }}
          >
            重试图片
          </button>
        </div>
      ) : (
        <>
          <img
            key={attempt}
            src={media.file}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
          {!loaded && (
            <span className="small-copy" role="status">
              照片加载中…
            </span>
          )}
        </>
      )}
      <figcaption>
        © {media.attribution} ·{" "}
        <a
          href={media.licenseUrl || media.source}
          target="_blank"
          rel="noreferrer"
        >
          {media.license}
        </a>{" "}
        ·{" "}
        <a href={media.source} target="_blank" rel="noreferrer">
          原作与授权 ↗
        </a>{" "}
        · 全图等比显示；商标及角色权利归相关权利人。
      </figcaption>
    </figure>
  );
}
