import type { DialogueIntent, IntentMatch } from "./DialogueIntent";

const unsafeTerms = [
  "address", "phone number", "email", "password", "meet me", "where do you live",
  "weapon", "kill", "blood", "drug", "gambling", "secret from parents",
];

const patterns: ReadonlyArray<{
  intent: DialogueIntent;
  terms: readonly string[];
}> = [
  { intent: "goodbye", terms: ["goodbye", "bye", "see you", "later", "gotta go", "i have to go"] },
  { intent: "ask-name", terms: ["your name", "who are you", "what are you called", "what's your name"] },
  { intent: "ask-role", terms: ["your job", "what do you do", "your role", "work here", "what do you work"] },
  { intent: "ask-memory", terms: ["remember", "memory", "what do you know about me", "do you know me"] },
  { intent: "ask-recipe", terms: ["recipe", "how do i make", "how to make", "ingredients for", "how do you cook", "how do you make"] },
  { intent: "ask-shop-ingredient", terms: ["can you help me find an ingredient", "find ingredient", "find an ingredient", "where is the bread", "where is cheese", "need ingredient", "where can i find", "do you have any"] },
  { intent: "ask-park-plants", terms: ["park plants", "water flowers", "about flowers", "about plants", "the flowers", "the trees", "the garden"] },
  { intent: "ask-cafe-food", terms: ["cafe food", "cafe drink", "menu", "order", "snack here", "what do you sell", "what's good here"] },
  { intent: "ask-current-location", terms: ["this place", "where are we", "about here", "what is this place"] },
  { intent: "ask-other-location", terms: ["where is", "how do i get to", "another place", "can we go to", "can we visit"] },
  { intent: "ask-character", terms: ["about khadija", "about sister", "about brother", "about mama", "about auntie", "tell me about"] },
  { intent: "ask-friendship", terms: ["our friendship", "are we friends", "friendship", "friends", "can we be friends", "do you like me", "best friends", "you're my friend"] },
  { intent: "mention-gift", terms: ["gift", "present", "gave you", "give you", "i brought you", "here you go", "this is for you"] },
  { intent: "mention-shared-activity", terms: ["we played", "we read", "our picnic", "did together", "remember when we", "that was fun"] },
  { intent: "ask-activity", terms: ["what can we do", "something fun", "activity", "play together", "what should we do", "let's play", "want to play"] },
  { intent: "ask-help", terms: ["help me", "can you help", "i need help", "what should i do", "i'm stuck", "how do i"] },
  { intent: "ask-food", terms: ["food", "snack", "hungry", "eat", "drink", "yummy", "thirsty"] },
  { intent: "ask-item", terms: ["this item", "holding", "what is this", "about the", "what's this", "what is that"] },
  { intent: "compliment", terms: ["you are kind", "you are nice", "great job", "i like you", "lovely", "you're the best", "you're awesome", "i love this"] },
  { intent: "express-sadness", terms: ["i am sad", "i'm sad", "feel sad", "upset", "unhappy", "crying", "want to cry"] },
  { intent: "express-tiredness", terms: ["i am tired", "i'm tired", "sleepy", "need rest", "so tired", "want to nap"] },
  { intent: "express-excitement", terms: ["i am excited", "i'm excited", "so excited", "wow", "yay", "awesome", "amazing"] },
  { intent: "express-happiness", terms: ["i am happy", "i'm happy", "feel happy", "glad", "so happy", "this is great"] },
  { intent: "greeting", terms: ["hello", "hi", "hey", "good morning", "salaam", "good afternoon", "hiya"] },
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