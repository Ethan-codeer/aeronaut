import records from "./liveries.json";
import { getAirline } from "./airlines";
import type { AirlineMedia } from "./airlines";
export interface Livery {
  slug: string;
  airlineSlug: string | null;
  organizationName?: string;
  country?: string;
  nameEn?: string;
  modelId?: string;
  liveryId?: string;
  concept?: boolean;
  manufacturer: string;
  scope: "fleet-standard" | "individual-aircraft";
  introducedYear: number | null;
  era: string;
  name: string;
  category: string;
  aircraftModel: string;
  aircraftSlug: string | null;
  design: string;
  story: string;
  period: null;
  periodNote: string;
  registration: string | null;
  photoDate: string | null;
  media: AirlineMedia | null;
  mediaStatus: string;
  sources: { label: string; url: string }[];
  verifiedAt: string;
}
export const liveries = records as Livery[];
export const getLivery = (slug: string) =>
  liveries.find((l) => l.slug === slug);
export const liveriesForAirline = (slug: string) =>
  liveries.filter((l) => l.airlineSlug === slug);

export const getLiveryOrganization = (l: Livery): string =>
  (l.airlineSlug ? getAirline(l.airlineSlug)?.nameZh : undefined) || l.organizationName || l.manufacturer;
export const getLiveryCountry = (l: Livery): string =>
  (l.airlineSlug ? getAirline(l.airlineSlug)?.country : undefined) || l.country || "未核实";
