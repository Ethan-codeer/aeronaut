import { readFileSync } from "node:fs";
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const models = [
  "a320neo",
  "a321xlr",
  "a330-900",
  "a350-900",
  "a380-800",
  "737-max-8",
  "747-8",
  "777-300er",
  "787-9",
  "767-300er",
  "e195-e2",
  "c919",
];
const routes = [
  "/",
  "/atlas",
  "/atlas/compare",
  "/atlas/compare?a=c919",
  "/academy",
  "/academy/quiz",
  "/academy/spotter",
  "/academy/airlines",
  "/world/airlines",
  ...JSON.parse(
    readFileSync(new URL("../data/airlines.json", import.meta.url), "utf8"),
  ).map((a) => `/world/airlines/${a.slug}`),
  "/dictionary",
  "/lab/anatomy",
  "/lab/3d-explorer",
  "/lab/instruments",
  "/academy/cockpit",
  "/academy/tails",
  "/world/liveries",
  "/world/airports",
  ...["dictionary", "liveries", "airports"].flatMap((name) =>
    JSON.parse(
      readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8"),
    ).map(
      (r) =>
        `${name === "dictionary" ? "/dictionary" : `/world/${name}`}/${r.slug}`,
    ),
  ),
  "/lab",
  "/world",
  "/hangar",
  "/credits",
  ...models.map((s) => `/atlas/${s}`),
];
const checked = new Map();
async function check(path) {
  if (checked.has(path)) return;
  const res = await fetch(new URL(path, base));
  if (res.status !== 200) throw Error(`${path} returned ${res.status}`);
  if (new URL(res.url).origin !== new URL(base).origin)
    throw Error(`${path} redirected outside the application origin`);
  const contentType = res.headers.get("content-type") ?? "";
  if (
    /\.(?:jpg|jpeg|png|svg|webp)(?:\?|$)/i.test(path) &&
    !contentType.startsWith("image/")
  )
    throw Error(`${path} did not return an image`);
  const html = await res.text();
  checked.set(path, true);
  return html;
}
const linked = new Set();
for (const route of routes) {
  const html = await check(route);
  if (
    !/<title>[^<]*AERONAUT[^<]*<\/title>/i.test(html) ||
    !html.includes('id="main"')
  )
    throw Error(
      `Expected the AERONAUT page at ${route}; check deployment protection and redirects`,
    );
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    const path = match[1].replaceAll("&amp;", "&");
    if (!path.startsWith("//") && !path.startsWith("/_next/")) linked.add(path);
  }
  console.log(`OK ${route}`);
}
for (const path of linked) await check(path);
for (const path of [
  "/not-a-real-route",
  "/atlas/not-an-aircraft",
  "/world/airlines/not-an-airline",
  "/dictionary/not-a-term",
  "/world/airports/not-an-airport",
  "/world/liveries/not-a-livery",
]) {
  const res = await fetch(new URL(path, base));
  if (res.status !== 404)
    throw Error(`Expected 404 at ${path}, got ${res.status}`);
}
console.log(
  `PASS: ${routes.length} application routes, ${linked.size} linked pages/assets, and 6 missing routes.`,
);
