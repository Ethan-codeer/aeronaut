import records from "./dictionary.json";
export type AviationTerm = (typeof records)[number];
export const terms: AviationTerm[] = records;
export const getTerm = (slug: string) => terms.find((t) => t.slug === slug);
export function filterTerms(query: string, category = "全部", letter = "全部") {
  const q = query.trim().toLocaleLowerCase();
  return terms.filter(
    (t) =>
      (category === "全部" || t.category === category) &&
      (letter === "全部" || t.nameEn[0].toUpperCase() === letter) &&
      `${t.nameEn} ${t.nameZh} ${t.abbreviation} ${t.definition}`
        .toLocaleLowerCase()
        .includes(q),
  );
}
