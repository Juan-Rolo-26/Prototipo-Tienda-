import { ARG_PROVINCES, getCitiesByProvince } from "../data/arLocations";

const BASE = "https://apis.datos.gob.ar/georef/api";

export async function fetchArgProvinces() {
  try {
    const res = await fetch(`${BASE}/provincias?campos=nombre&max=100`);
    if (!res.ok) throw new Error("provincias_fetch_failed");
    const data = await res.json();
    const names = (data.provincias || []).map((item) => item.nombre).filter(Boolean);
    if (!names.length) throw new Error("empty_provinces");
    return names.sort((a, b) => a.localeCompare(b, "es"));
  } catch {
    return ARG_PROVINCES;
  }
}

export async function fetchArgCitiesByProvince(province) {
  if (!province) return [];
  try {
    const params = new URLSearchParams({
      provincia: province,
      campos: "nombre",
      max: "5000",
    });
    const res = await fetch(`${BASE}/localidades?${params.toString()}`);
    if (!res.ok) throw new Error("cities_fetch_failed");
    const data = await res.json();
    const names = (data.localidades || []).map((item) => item.nombre).filter(Boolean);
    if (!names.length) throw new Error("empty_cities");
    const unique = [...new Set(names)];
    return unique.sort((a, b) => a.localeCompare(b, "es"));
  } catch {
    return getCitiesByProvince(province);
  }
}
