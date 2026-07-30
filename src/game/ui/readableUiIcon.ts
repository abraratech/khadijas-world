const MOJIBAKE_MARKERS =
  /[\u00c2\u00c3\u00e2\u00ef\u00f0\u0178\ufffd]/u;

const FALLBACK_ICON = "\u2726";

export function readableUiIcon(value: string): string {
  const icon = value.trim();

  if (!icon || MOJIBAKE_MARKERS.test(icon)) {
    return FALLBACK_ICON;
  }

  return icon;
}
