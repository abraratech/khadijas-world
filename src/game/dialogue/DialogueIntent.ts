export const DIALOGUE_INTENTS = [
  "greeting",
  "goodbye",
  "ask-name",
  "ask-role",
  "ask-current-location",
  "ask-other-location",
  "ask-character",
  "ask-item",
  "ask-food",
  "ask-recipe",
  "ask-activity",
  "ask-help",
  "ask-memory",
  "compliment",
  "express-happiness",
  "express-sadness",
  "express-excitement",
  "express-tiredness",
  "ask-friendship",
  "mention-gift",
  "mention-shared-activity",
  "ask-shop-ingredient",
  "ask-park-plants",
  "ask-cafe-food",
  "safe-redirect",
  "unknown",
] as const;

export type DialogueIntent = typeof DIALOGUE_INTENTS[number];

export interface IntentMatch {
  intent: DialogueIntent;
  debugScore: number;
}

