import records from "./airports.json";
export type Airport = (typeof records)[number];
export const airports: Airport[] = records;
export const regions = [
  "亚洲",
  "欧洲",
  "北美",
  "南美",
  "非洲",
  "中东",
  "大洋洲",
];
export const getAirport = (slug: string) =>
  airports.find((a) => a.slug === slug);
export const airportsForAirline = (slug: string) =>
  airports.filter((a) => a.hubAirlineSlugs.includes(slug));
export function filterAirports(query: string, region = "全部") {
  const q = query.trim().toLowerCase();
  return airports.filter(
    (a) =>
      (region === "全部" || a.region === region) &&
      `${a.nameZh} ${a.nameEn} ${a.iata} ${a.icao} ${a.city} ${a.country}`
        .toLowerCase()
        .includes(q),
  );
}
