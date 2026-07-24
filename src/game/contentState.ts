export interface ContentState {
  homeTvOn: boolean;
  bedroomMusicBoxOn: boolean;
  streetMailboxOpen: boolean;
  cafeBellCount: number;
}

export function createDefaultContentState(): ContentState {
  return {
    homeTvOn: false,
    bedroomMusicBoxOn: false,
    streetMailboxOpen: false,
    cafeBellCount: 0,
  };
}

export function normalizeContentState(value: unknown): ContentState {
  const fallback = createDefaultContentState();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<ContentState>;
  return {
    homeTvOn: candidate.homeTvOn === true,
    bedroomMusicBoxOn: candidate.bedroomMusicBoxOn === true,
    streetMailboxOpen: candidate.streetMailboxOpen === true,
    cafeBellCount: typeof candidate.cafeBellCount === "number"
      ? Math.max(0, Math.min(999, Math.floor(candidate.cafeBellCount)))
      : 0,
  };
}
