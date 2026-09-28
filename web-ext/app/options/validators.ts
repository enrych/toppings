// Number("") and Number("  ") are 0, so a cleared field would otherwise pass
// as a real value.
export const isSeconds = (v: string) => v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) > 0;

export const isNudgeStep = (v: string, maxStep: number) => isSeconds(v) && Number(v) <= maxStep;

export const isNudgeMax = (v: string, baseStep: number) => isSeconds(v) && Number(v) >= baseStep;
