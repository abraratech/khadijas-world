import type { DialogueIntent, IntentMatch } from "./DialogueIntent";

const unsafeTerms = [
  "address", "phone number", "email", "password", "meet me", "where do you live",
  "weapon", "kill", "blood", "drug", "gambling", "secret from parents",
];

const patterns: ReadonlyArray<{
  intent: DialogueIntent;
  terms: readonly string[];
}> = [
  { intent: "goodbye", terms: ["goodbye", "bye", "see you", "later"] },
  { intent: "ask-name", terms: ["your name", "who are you", "what are you called"] },
  { intent: "ask-role", terms: ["your job", "what do you do", "your role", "work here"] },
  { intent: "ask-memory", terms: ["remember", "memory", "what do you know about me"] },
  { intent: "ask-recipe", terms: ["recipe", "how do i make", "how to make", "ingredients for"] },
  { intent: "ask-shop-ingredient", terms: ["can you help me find an ingredient", "find ingredient", "find an ingredient", "where is the bread", "where is cheese", "need ingredient"] },
  { intent: "ask-park-plants", terms: ["park plants", "water flowers", "about flowers", "about plants"] },
  { intent: "ask-cafe-food", terms: ["cafe food", "cafe drink", "menu", "order", "snack here"] },
  { intent: "ask-current-location", terms: ["this place", "where are we", "about here"] },
  { intent: "ask-other-location", terms: ["where is", "how do i get to", "another place"] },
  { intent: "ask-character", terms: ["about khadija", "about sister", "about brother", "about mama", "about auntie"] },
  { intent: "ask-friendship", terms: ["our friendship", "are we friends", "friendship", "friends"] },
  { intent: "mention-gift", terms: ["gift", "present", "gave you", "give you"] },
  { intent: "mention-shared-activity", terms: ["we played", "we read", "our picnic", "did together"] },
  { intent: "ask-activity", terms: ["what can we do", "something fun", "activity", "play together"] },
  { intent: "ask-help", terms: ["help me", "can you help", "i need help", "what should i do"] },
  { intent: "ask-food", terms: ["food", "snack", "hungry", "eat", "drink"] },
  { intent: "ask-item", terms: ["this item", "holding", "what is this", "about the"] },
  { intent: "compliment", terms: ["you are kind", "you are nice", "great job", "i like you", "lovely"] },
  { intent: "express-sadness", terms: ["i am sad", "i'm sad", "feel sad", "upset", "unhappy"] },
  { intent: "express-tiredness", terms: ["i am tired", "i'm tired", "sleepy", "need rest"] },
  { intent: "express-excitement", terms: ["i am excited", "i'm excited", "so excited", "wow"] },
  { intent: "express-happiness", terms: ["i am happy", "i'm happy", "feel happy", "glad"] },
  { intent: "greeting", terms: ["hello", "hi", "hey", "good morning", "salaam"] },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}'\s-]/gu, " ").replace(/\s+/g, " ").trim();
}

export function recognizeIntent(text: string): IntentMatch {
  const normalized = normalize(text);
  if (!normalized) return { intent: "unknown", debugScore: 0 };
  if (unsafeTerms.some((term) => normalized.includes(term))) {
    return { intent: "safe-redirect", debugScore: 1 };
  }
  let best: IntentMatch = { intent: "unknown", debugScore: 0 };
  for (const pattern of patterns) {
    const score = pattern.terms.reduce(
      (total, term) => total + (normalized.includes(term) ? term.split(" ").length : 0),
      0,
    );
    if (score > best.debugScore) best = { intent: pattern.intent, debugScore: score };
  }
  return best;
}
