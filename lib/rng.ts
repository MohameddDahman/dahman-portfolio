/**
 * Seeded PRNG (mulberry32).
 *
 * The figure's tree is generated from this rather than Math.random, so a
 * given build always draws the same tree. A diagram that reshuffles on
 * every reload is a decoration; one that holds still is an illustration.
 */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
