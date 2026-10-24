"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowUpRight, Heart, Plane } from "lucide-react";
import type { Aircraft } from "@/data/aircraft";
import { useProgress } from "./providers";
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
export function SafeImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
      <Plane size={46} />
      <span>机型示意图暂不可用</span>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
export function Favorite({
  slug,
  large = false,
}: {
  slug: string;
  large?: boolean;
}) {
  const { progress, update, ready } = useProgress();
  const saved = progress.favorites.includes(slug);
  return (
    <button
      disabled={!ready}
      className={large ? "button secondary" : "favorite"}
      aria-label={saved ? "取消收藏" : "收藏飞机"}
      aria-pressed={saved}
      onClick={() =>
        update((p) => ({
          ...p,
          favorites: saved
            ? p.favorites.filter((x) => x !== slug)
            : [...p.favorites, slug],
        }))
      }
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
      {large && (saved ? "已加入机库" : "加入我的机库")}
    </button>
  );
}
export function Visit({ slug }: { slug: string }) {
  const { ready, update } = useProgress();
  useEffect(() => {
    if (ready)
      update((p) =>
        p.visited.includes(slug) ? p : { ...p, visited: [...p.visited, slug] },
      );
  }, [slug, ready, update]);
  return null;
}
export function AircraftCard({ aircraft: a }: { aircraft: Aircraft }) {
  return (
    <article className="aircraft-card">
      <div className="aircraft-image">
        <Link href={`/atlas/${a.slug}`} tabIndex={-1} aria-hidden="true">
          <SafeImage
            src={a.image}
            alt={`${a.manufacturer} ${a.model}${a.imageSource ? " 飞机照片" : " 原创外形示意图"}`}
          />
        </Link>
        <span className="image-label">{a.category}</span>
        <Favorite slug={a.slug} />
        {a.imageSource && (
          <a
            className="photo-credit"
            href={a.imageSource}
            target="_blank"
            rel="noreferrer"
          >
            © {a.imageCredit}
          </a>
        )}
      </div>
      <div className="aircraft-body">
        <span className="eyebrow">{a.manufacturer.toUpperCase()}</span>
        <Link className="aircraft-title" href={`/atlas/${a.slug}`}>
          <h3>{a.model}</h3>
          <ArrowUpRight size={20} />
        </Link>
        <p>{a.intro}</p>
        <div className="aircraft-specs">
          <span>
            航程{" "}
            <b>
              {a.specs.range?.toLocaleString()} <small>km</small>
            </b>
          </span>
          <span>
            参考载客{" "}
            <b>
              {a.specs.seats} <small>人</small>
            </b>
          </span>
        </div>
      </div>
    </article>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow blue">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
