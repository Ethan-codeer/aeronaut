"use client";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import type { Airport } from "@/data/airports";
import { clusterPoints } from "@/lib/airport-map";
export default function AirportMap({
  items,
  selected,
  onSelect,
  quiz = false,
}: {
  items: Airport[];
  selected?: string;
  onSelect?: (slug: string) => void;
  quiz?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const itemsRef = useRef(items);
  const callbackRef = useRef(onSelect);
  const selectedRef = useRef(selected);
  const [interactive, setInteractive] = useState(false);
  const interactiveRef = useRef(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [tileError, setTileError] = useState(false);
  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | undefined;
    let timer: ReturnType<typeof setTimeout>;
    async function setup() {
      try {
        const L = await import("leaflet");
        if (disposed || !container.current) return;
        map = L.map(container.current, {
          dragging: interactiveRef.current,
          worldCopyJump: true,
          scrollWheelZoom: false,
          keyboard: true,
          touchZoom: true,
          zoomControl: true,
        }).setView([22, 18], 2);
        mapRef.current = map;
        const group = L.layerGroup().addTo(map);
        const tiles = L.tileLayer(
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 2,
            noWrap: true,
          },
        );
        tiles.on("tileerror", () => {
          if (!disposed) setTileError(true);
        });
        tiles.on("load", () => {
          if (!disposed) setStatus("ready");
          clearTimeout(timer);
        });
        tiles.addTo(map);
        timer = setTimeout(() => {
          if (!disposed) {
            setStatus("ready");
            setTileError(true);
          }
        }, 12000);
        const redraw = () => {
          if (!map) return;
          group.clearLayers();
          const groups = clusterPoints(
            itemsRef.current,
            (a) => map!.project([a.latitude, a.longitude], map!.getZoom()),
            64,
          );
          for (const points of groups) {
            const lat =
                points.reduce((v, a) => v + a.latitude, 0) / points.length,
              lon = points.reduce((v, a) => v + a.longitude, 0) / points.length;
            if (points.length > 1) {
              const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                  className: "airport-cluster",
                  html: `<span>${points.length}</span>`,
                  iconSize: [44, 44],
                  iconAnchor: [22, 22],
                }),
                title: `${points.length} 座机场，点击放大`,
                keyboard: true,
              }).addTo(group);
              marker.on("click", () =>
                map!.setView([lat, lon], map!.getZoom() + 2, {
                  animate: false,
                }),
              );
            } else {
              const a = points[0];
              const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                  className: `airport-marker ${a.slug === selectedRef.current ? "selected" : ""}`,
                  html: `<span>${quiz ? "•" : a.iata}</span>`,
                  iconSize: [44, 44],
                  iconAnchor: [22, 22],
                }),
                title: quiz ? "选择这个机场" : `${a.iata} ${a.nameZh}`,
                keyboard: true,
              }).addTo(group);
              marker.on("click", () => callbackRef.current?.(a.slug));
            }
          }
        };
        map.on("zoomend moveend", redraw);
        map.on("aeronaut:update", redraw);
        redraw();
        setStatus("ready");
      } catch {
        if (!disposed) setStatus("error");
      }
    }
    void setup();
    return () => {
      disposed = true;
      clearTimeout(timer);
      map?.remove();
      mapRef.current = null;
    };
  }, [attempt, quiz]);
  useEffect(() => {
    itemsRef.current = items;
    callbackRef.current = onSelect;
    selectedRef.current = selected;
    mapRef.current?.fire("aeronaut:update");
  }, [items, selected, onSelect]);
  function toggleInteraction() {
    const next = !interactive;
    interactiveRef.current = next;
    setInteractive(next);
    if (next) mapRef.current?.dragging.enable();
    else mapRef.current?.dragging.disable();
  }
  function retry() {
    setStatus("loading");
    setTileError(false);
    setAttempt((a) => a + 1);
  }
  return (
    <div className="map-shell">
      <div
        className="airport-map"
        ref={container}
        role="region"
        aria-label={
          quiz
            ? "机场位置挑战地图"
            : "全球机场地图，可拖动、双指缩放，Tab选择标记"
        }
      />
      {status === "loading" && (
        <div className="map-loading" role="status">
          正在准备地图…
        </div>
      )}
      {(status === "error" || tileError) && (
        <div className="map-error" role="status">
          {status === "error" ? "地图无法启动。" : "部分底图瓦片未能加载。"}
          可继续使用下方机场列表。<button onClick={retry}>重试地图</button>
        </div>
      )}
      <p className="map-help">
        <button
          className="button secondary"
          aria-pressed={interactive}
          onClick={toggleInteraction}
        >
          {interactive ? "锁定地图 · 恢复页面滚动" : "解锁地图拖动"}
        </button>
        {interactive
          ? "地图已解锁；使用按钮恢复页面滚动。"
          : "默认锁定拖动以便滚动页面；缩放按钮仍可用。"}
        拖动探索 · 双指或 + / − 缩放 · 数字标记为机场聚合。底图 ©
        OpenStreetMap，机场坐标 © OurAirports（公有领域）。
      </p>
    </div>
  );
}
