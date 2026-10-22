import records from "./airlines.json";
export interface AirlineMedia {
  file: string;
  source: string;
  license: string;
  attribution: string;
  licenseUrl?: string;
}
export interface Airline {
  slug: string;
  nameZh: string;
  nameEn: string;
  country: string;
  headquarters: string;
  iata: string;
  icao: string;
  foundedYear: number;
  foundedNote: string;
  alliance: string;
  history: string;
  story: string;
  liveryDescription: string;
  fleet: { aircraftSlug: string; source: string; asOf: string }[];
  sources: { label: string; url: string; checkedAt: string }[];
  verifiedAt: string;
  logo: AirlineMedia | null;
  livery: AirlineMedia | null;
  pending: string[];
  sourceAccessNote?: string;
}
export const airlines = records as Airline[];
export const getAirline = (slug: string) =>
  airlines.find((a) => a.slug === slug);
export const airlinesForAircraft = (slug: string) =>
  airlines.filter((a) => a.fleet.some((f) => f.aircraftSlug === slug));
