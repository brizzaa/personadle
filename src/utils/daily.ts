import type { Persona } from "../types/Persona";

// Puzzle giornaliero deterministico: stesso giorno UTC = stesso Persona per tutti.
// L'ordine dei giorni è una permutazione seedata, così non coincide con l'ordine del JSON.

const EPOCH_UTC = Date.UTC(2025, 0, 1); // 1 gen 2025
const MS_PER_DAY = 86_400_000;
const SEED = 0x9e3779b9;

export const getDayNumber = (now: number = Date.now()): number =>
  Math.floor((now - EPOCH_UTC) / MS_PER_DAY);

export const msUntilNextDay = (now: number = Date.now()): number =>
  MS_PER_DAY - ((now - EPOCH_UTC) % MS_PER_DAY);

// mulberry32 — PRNG deterministico per la permutazione
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const getDailyPersona = (personas: Persona[], day: number): Persona => {
  const indices = personas.map((_, i) => i);
  const rand = mulberry32(SEED);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const idx = indices[((day % indices.length) + indices.length) % indices.length];
  return personas[idx];
};
