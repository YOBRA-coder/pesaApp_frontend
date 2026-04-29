// Client-side game utilities (mirror backend formulas for UI display)

const HOUSE_EDGE = 0.03;
const GRID_SIZE = 25;

/**
 * Calculate Mines multiplier
 * Mirrors backend minesGame.service.ts calcMinesMultiplier
 */
export function calcMinesMultiplier(minesCount: number, gemsFound: number): number {
  if (gemsFound === 0) return 1.00;
  const safeTotal = GRID_SIZE - minesCount;
  let mult = 1;
  for (let i = 0; i < gemsFound; i++) {
    mult *= (GRID_SIZE - minesCount - i) / (GRID_SIZE - i);
  }
  const pSurvive = mult;
  const fairMult = 1 / pSurvive;
  return parseFloat(Math.max(1, fairMult * (1 - HOUSE_EDGE)).toFixed(4));
}

/**
 * Calculate Dice multiplier
 */
export function calcDiceMultiplier(target: number, mode: 'OVER' | 'UNDER'): number {
  const winChance = mode === 'OVER' ? (100 - target) : target;
  return parseFloat(((100 / winChance) * (1 - HOUSE_EDGE)).toFixed(4));
}

export function calcDiceWinChance(target: number, mode: 'OVER' | 'UNDER'): number {
  return mode === 'OVER' ? (100 - target) : target;
}

/**
 * Plinko multipliers
 */
export const PLINKO_MULTIPLIERS = {
  LOW:    [1.5, 1.2, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 1.2, 1.5],
  MEDIUM: [5.6, 2.1, 1.4, 1.1, 0.6, 0.3, 0.6, 1.1, 1.4, 2.1, 5.6],
  HIGH:   [110, 41, 10, 5, 3, 0.5, 3, 5, 10, 41, 110],
};

/**
 * Crash: expected value
 */
export function crashExpectedValue(houseEdge = 0.05): number {
  return 1 - houseEdge;
}

/**
 * Format multiplier color
 */
export function multColor(mult: number): string {
  if (mult >= 10) return '#f0c040';
  if (mult >= 3) return '#00e57a';
  if (mult >= 1) return '#ffffff';
  return '#ff4d6a';
}
