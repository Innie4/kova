const DEMO_QUERY_VALUE = "1";

export const DEMO_INTENT = "Send $150 to Nigeria";
export const DEMO_STEP_DELAY_MS = 2000;
export const DEMO_RAIL_REVEAL_MS = 550;
export const DEMO_PROGRESS_TICK_MS = 450;

export function isDemoModeEnabled() {
  return process.env.DEMO_MODE === "true";
}

export function isDemoQueryEnabled(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value.includes(DEMO_QUERY_VALUE);
  }

  return value === DEMO_QUERY_VALUE;
}

export function resolveDemoMode(value?: string | string[]) {
  return isDemoModeEnabled() || isDemoQueryEnabled(value);
}
