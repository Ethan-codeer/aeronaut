"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "./use-theme";
import {
  ArrowUpRight,
  ArrowRight,
  Plane,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  Globe2,
} from "lucide-react";
const nav = [
  ["/", "探索首页"],
  ["/atlas", "飞机百科"],
  ["/academy", "航空挑战"],
  ["/lab", "飞行实验室"],
  ["/world", "航空世界"],
  ["/dictionary", "术语词典"],
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { dark, toggle: theme } = useTheme();
  return (
    <header className="header">
      <div className="nav-wrap">
        <Link href="/" className="logo" aria-label="AERONAUT 首页">
          <span className="brand-icon">
            <Plane size={24} />
          </span>
          AERONAUT<span className="brand-dot">®</span>
        </Link>
        <nav
          className={open ? "desktop-nav is-open" : "desktop-nav"}
          aria-label="主要导航"
        >
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={
                (href === "/" ? pathname === "/" : pathname.startsWith(href))
                  ? "active"
                  : ""
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Link
            href="/atlas"
            className="icon-btn nav-search"
            aria-label="搜索飞机"
          >
            <Search size={18} />
          </Link>
          <button
            className="icon-btn"
            onClick={theme}
            aria-label={dark ? "切换浅色主题" : "切换深色主题"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <span className="nav-divider" />
          <Link href="/hangar" className="hangar-link">
            <Plane size={16} />
            我的机库
            <ArrowUpRight size={15} />
          </Link>
          <button
            className="icon-btn menu-btn"
            aria-expanded={open}
            aria-label="展开导航"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div>
          <Link href="/" className="logo">
            <Plane size={23} /> AERONAUT
          </Link>
          <p>The World of Flight, at Your Fingertips.</p>
        </div>
        <div className="footer-links">
          <Link href="/atlas">探索百科</Link>
          <Link href="/academy">开始挑战</Link>
          <Link href="/lab">飞行科学</Link>
          <Link href="/lab/3d-explorer" prefetch={false}>
            3D 飞机探索
          </Link>
          <Link href="/hangar">我的机库</Link>
          <Link href="/credits">资料与署名</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} AERONAUT · 为每一份向往天空的好奇心而造
        </span>
        <span>
          <Globe2 size={13} /> 简体中文 / EN terminology{" "}
          <span className="status-dot" /> V1.2
        </span>
      </div>
    </footer>
  );
}
export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowRight size={16} />
    </Link>
  );
}
