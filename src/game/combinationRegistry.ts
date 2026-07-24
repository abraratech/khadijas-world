export type CombinationSound =
  | "combine"
  | "recipe"
  | "appliance"
  | "water";

export interface CombinationDefinition {
  id: string;
  label: string;
  requiredInputs: readonly string[];
  station: string;
  appliance?: string;
  result: string;
  durationMs: number;
  message: string;
  sound: CombinationSound;
  consumeInputs: boolean;
  repeatable: boolean;
}

export const COMBINATIONS: readonly CombinationDefinition[] = [
  {
    id: "fruit-bowl",
    label: "Fruit bowl",
    requiredInputs: ["apple", "banana"],
    station: "mixing-bowl",
    result: "prepared-fruit-bowl",
    durationMs: 650,
    message: "A bright fruit bowl is ready to share!",
    sound: "recipe",
    consumeInputs: true,
    repeatable: true,
  },
  {
    id: "sandwich",
    label: "Sandwich",
    requiredInputs: ["bread", "cheese"],
    station: "prep-plate",
    result: "sandwich",
    durationMs: 600,
    message: "The sandwich is stacked and ready!",
    sound: "recipe",
    consumeInputs: true,
    repeatable: true,
  },
  {
    id: "toast",
    label: "Toast",
    requiredInputs: ["bread"],
    station: "toaster",
    appliance: "toaster",
    result: "toast",
    durationMs: 900,
    message: "Pop! Warm toast is ready!",
    sound: "appliance",
    consumeInputs: true,
    repeatable: true,
  },
  {
    id: "juice",
    label: "Fruit juice",
    requiredInputs: ["berries"],
    station: "blender",
    appliance: "blender",
    result: "juice",
    durationMs: 950,
    message: "Whizz! Fresh fruit juice is ready!",
    sound: "recipe",
    consumeInputs: true,
    repeatable: true,
  },
  {
    id: "cupcake",
    label: "Cupcake",
    requiredInputs: ["cake-mix"],
    station: "oven",
    appliance: "oven",
    result: "cupcake",
    durationMs: 1100,
    message: "A little baked treat is ready!",
    sound: "recipe",
    consumeInputs: true,
    repeatable: true,
  },
  {
    id: "tea",
    label: "Warm tea",
    requiredInputs: ["tea-leaves", "cup"],
    station: "kettle",
    appliance: "kettle",
    result: "tea",
    durationMs: 850,
    message: "A cozy warm drink is ready!",
    sound: "water",
    consumeInputs: true,
    repeatable: true,
  },
] as const;

function sameItems(first: readonly string[], second: readonly string[]): boolean {
  if (first.length !== second.length) return false;
  const sortedFirst = [...first].sort();
  const sortedSecond = [...second].sort();
  return sortedFirst.every((value, index) => value === sortedSecond[index]);
}

export function findCompletedCombination(
  station: string,
  inputs: readonly string[],
): CombinationDefinition | null {
  return COMBINATIONS.find((combination) => (
    combination.station === station && sameItems(combination.requiredInputs, inputs)
  )) ?? null;
}

export function acceptsCombinationInput(
  station: string,
  currentInputs: readonly string[],
  itemId: string,
): boolean {
  return COMBINATIONS.some((combination) => {
    if (combination.station !== station) return false;
    const remaining = [...combination.requiredInputs];
    for (const current of currentInputs) {
      const index = remaining.indexOf(current);
      if (index < 0) return false;
      remaining.splice(index, 1);
    }
    return remaining.includes(itemId);
  });
}

