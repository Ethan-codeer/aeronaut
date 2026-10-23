// @vitest-environment jsdom
import React from "react";
import { describe, it, vi, expect, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { airports } from "../data/airports";
import AirportMap from "../components/airport-map";
const mock = vi.hoisted(() => ({
  handlers: new Map<string, () => void>(),
  remove: vi.fn(),
  starts: vi.fn(),
  fail: false,
}));
vi.mock("leaflet", () => ({
  map: () => {
    mock.starts();
    if (mock.fail) {
      mock.fail = false;
      throw Error("map unavailable");
    }
    const handlers = new Map<string, () => void>();
    const map = {
      setView: () => map,
      getZoom: () => 2,
      project: ([lat, lon]: number[]) => ({ x: lon * 10, y: lat * 10 }),
      on: (event: string, cb: () => void) => {
        handlers.set(event, cb);
        return map;
      },
      fire: (event: string) => handlers.get(event)?.(),
      remove: mock.remove,
    };
    return map;
  },
  layerGroup: () => {
    const group = { addTo: () => group, clearLayers: vi.fn() };
    return group;
  },
  tileLayer: () => {
    const layer = {
      on: (event: string, cb: () => void) => {
        mock.handlers.set(event, cb);
        return layer;
      },
      addTo: () => layer,
    };
    return layer;
  },
  divIcon: (options: unknown) => options,
  marker: () => {
    const marker = { addTo: () => marker, on: () => marker };
    return marker;
  },
}));
afterEach(() => {
  cleanup();
  mock.handlers.clear();
  mock.starts.mockClear();
  mock.remove.mockClear();
});
describe("map resource failures", () => {
  it("reports failed tiles and recreates only the map on retry", async () => {
    render(<AirportMap items={airports} />);
    await waitFor(() => expect(mock.handlers.has("tileerror")).toBe(true));
    const { act } = await import("@testing-library/react");
    await act(async () => mock.handlers.get("tileerror")!());
    expect(screen.getByText(/部分底图瓦片未能加载/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "重试地图" }));
    await waitFor(() => expect(mock.starts).toHaveBeenCalledTimes(2));
    expect(mock.remove).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/部分底图瓦片未能加载/)).toBeNull();
  });
  it("recovers from an initialization error through the retry control", async () => {
    mock.fail = true;
    render(<AirportMap items={airports} />);
    await waitFor(() => expect(screen.getByText(/地图无法启动/)).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "重试地图" }));
    await waitFor(() => expect(mock.handlers.has("tileerror")).toBe(true));
    expect(screen.queryByText(/地图无法启动/)).toBeNull();
  });
});
