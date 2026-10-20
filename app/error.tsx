"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container empty-state">
      <h1>遇到了一点气流。</h1>
      <p>页面暂时无法加载，请重新尝试。</p>
      <button className="button primary" onClick={reset}>
        重新加载
      </button>
    </div>
  );
}
