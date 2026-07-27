export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export type FocusDirection = 1 | -1;

export function nextFocusIndex(
  length: number,
  currentIndex: number,
  direction: FocusDirection,
): number {
  if (length <= 0) return -1;
  if (currentIndex < 0 || currentIndex >= length) {
    return direction === 1 ? 0 : length - 1;
  }
  return (currentIndex + direction + length) % length;
}

export function isTextEntryElement(
  tagName: string,
  isContentEditable = false,
): boolean {
  if (isContentEditable) return true;
  return ["input", "textarea", "select"].includes(tagName.trim().toLowerCase());
}
