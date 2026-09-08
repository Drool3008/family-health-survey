// One code per family. Hand a family's code to every member of that family;
// they all enter the same code, so their answers group together. Q0.4 then
// records who each member is (coordinator / helper / recipient / peripheral).
// Edit this list freely. Codes are matched case-insensitively, whitespace trimmed.
export const FAMILY_CODES = [
  "MANGO47", "TIGER22", "RIVER83", "LOTUS61",
  "PEARL39", "CEDAR54", "AMBER70", "OLIVE28",
  "CORAL95", "MAPLE16", "IVORY43", "SLATE88",
];

// Returns the canonical code if valid, else null.
export function normalizeCode(input: string): string | null {
  const c = (input ?? "").trim().toUpperCase();
  return FAMILY_CODES.includes(c) ? c : null;
}
