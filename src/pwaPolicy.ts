export type PwaConnectionLabel = {
  label: string;
  tone: "online" | "offline";
};

export type NetworkInformationLike = {
  saveData?: boolean;
  effectiveType?: string;
};

export function describePwaConnection(online: boolean): PwaConnectionLabel {
  return online
    ? { label: "Online · cloud features available", tone: "online" }
    : { label: "Offline · local play and saves remain available", tone: "offline" };
}

export function shouldAutoWarmOfflineCache(connection?: NetworkInformationLike): boolean {
  if (connection?.saveData) return false;
  return !connection?.effectiveType || connection.effectiveType === "4g";
}
