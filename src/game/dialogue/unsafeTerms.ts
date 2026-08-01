/**
 * Shared, conservative safety and personal-information gate used in both
 * the browser and the Cloudflare Function. It intentionally favors a safe
 * rule-based redirect over sending uncertain text to a model.
 */
export const UNSAFE_DIALOGUE_TERMS: readonly string[] = [
  "address",
  "phone number",
  "email",
  "password",
  "full name",
  "real name",
  "where do you live",
  "what school",
  "my school",
  "meet me",
  "meet in person",
  "contact me",
  "social media",
  "secret from parents",
  "send a photo",
  "send a picture",
  "weapon",
  "kill",
  "blood",
  "drug",
  "gambling",
  "suicide",
  "self harm",
  "naked",
  "sex",
];

const PHONE_LIKE = /\b(?:\+?\d[\d\s().-]{6,}\d)\b/;
const EMAIL_LIKE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const URL_LIKE = /(?:https?:\/\/|www\.)\S+/i;
const SOCIAL_HANDLE_LIKE = /(^|\s)@[a-z0-9_]{2,32}\b/i;

export function normalizeDialogueText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s@.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsUnsafeTerm(normalizedText: string): boolean {
  return UNSAFE_DIALOGUE_TERMS.some((term) => normalizedText.includes(term));
}

export function looksLikePii(rawText: string): boolean {
  return PHONE_LIKE.test(rawText)
    || EMAIL_LIKE.test(rawText)
    || URL_LIKE.test(rawText)
    || SOCIAL_HANDLE_LIKE.test(rawText);
}

export function isUnsafeDialogueInput(rawText: string): boolean {
  const normalized = normalizeDialogueText(rawText);
  return containsUnsafeTerm(normalized) || looksLikePii(rawText);
}
