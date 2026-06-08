export type InterventionPresentation = "simple" | "find_three" | "triangle_breath";

type InterventionEntry = {
  id: string;
  presentation: InterventionPresentation;
  debugLabel: string;
};

export const INTERVENTION_REGISTRY = [
  {
    id: "feet_on_ground",
    presentation: "simple",
    debugLabel: "Feet",
  },
  {
    id: "find_three_things",
    presentation: "find_three",
    debugLabel: "Find 3",
  },
  {
    id: "triangle_breath",
    presentation: "triangle_breath",
    debugLabel: "Triangle",
  },
  {
    id: "relax_jaw",
    presentation: "simple",
    debugLabel: "Jaw",
  },
  {
    id: "drop_shoulders",
    presentation: "simple",
    debugLabel: "Shoulders",
  },
  {
    id: "notice_three_sounds",
    presentation: "simple",
    debugLabel: "Sounds",
  },
  {
    id: "press_palms_together",
    presentation: "simple",
    debugLabel: "Palms",
  },
] as const satisfies readonly InterventionEntry[];

export type InterventionType = (typeof INTERVENTION_REGISTRY)[number]["id"];

export type SimpleInterventionType = Extract<
  (typeof INTERVENTION_REGISTRY)[number],
  { presentation: "simple" }
>["id"];

export const ALL_INTERVENTIONS: readonly InterventionType[] = INTERVENTION_REGISTRY.map((entry) => entry.id);

export const DEFAULT_INTERVENTION: InterventionType = ALL_INTERVENTIONS[0]!;

const registryById = new Map<InterventionType, (typeof INTERVENTION_REGISTRY)[number]>(
  INTERVENTION_REGISTRY.map((entry) => [entry.id, entry]),
);

export function getIntervention(id: InterventionType) {
  const entry = registryById.get(id);
  if (!entry) throw new Error(`Unknown intervention: ${id}`);
  return entry;
}

export function isSimpleInstruction(id: InterventionType): id is SimpleInterventionType {
  return getIntervention(id).presentation === "simple";
}
