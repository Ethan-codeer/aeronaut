import records from "./liveries.json";
import type { AirlineMedia } from "./airlines";
export interface Livery {
  slug: string;
  airlineSlug: string;
  name: string;
  category: string;
  aircraftModel: string;
  aircraftSlug: string | null;
  design: string;
  story: string;
  period: null;
  periodNote: string;
  registration: null;
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
