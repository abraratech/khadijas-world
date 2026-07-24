import type { NpcId } from "../../livingCharacters";
import type { DialogueIntent } from "../../dialogue/DialogueIntent";

export interface NpcDialogueProfile {
  id: NpcId;
  displayName: string;
  portrait: string;
  role: string;
  personalityTraits: readonly string[];
  favoriteTopics: readonly string[];
  speakingStyle: string;
  homeLocation: string;
  allowedIntents: readonly DialogueIntent[];
  fallbackResponses: readonly string[];
}

const commonIntents: readonly DialogueIntent[] = [
  "greeting", "goodbye", "ask-name", "ask-role", "ask-current-location",
  "ask-other-location", "ask-character", "ask-item", "ask-food", "ask-recipe",
  "ask-activity", "ask-help", "ask-memory", "compliment", "express-happiness",
  "express-sadness", "express-excitement", "express-tiredness", "ask-friendship",
  "mention-gift", "mention-shared-activity", "unknown", "safe-redirect",
];

export const NPC_DIALOGUE_PROFILES: Record<NpcId, NpcDialogueProfile> = {
  parent: {
    id: "parent",
    displayName: "Mama",
    portrait: "👩🏽",
    role: "Khadija's caring guardian",
    personalityTraits: ["gentle", "encouraging", "family-minded"],
    favoriteTopics: ["family", "reading", "tidying"],
    speakingStyle: "warm and reassuring",
    homeLocation: "home",
    allowedIntents: commonIntents,
    fallbackResponses: ["We can talk about family, stories, snacks, or something fun to do!"],
  },
  neighbor: {
    id: "neighbor",
    displayName: "Auntie Noor",
    portrait: "👩🏾",
    role: "a friendly neighborhood helper",
    personalityTraits: ["friendly", "curious", "community-minded"],
    favoriteTopics: ["neighborhood", "mailbox", "flowers"],
    speakingStyle: "bright and neighborly",
    homeLocation: "street",
    allowedIntents: commonIntents,
    fallbackResponses: ["Let's talk about our neighborhood, the park, or our friends!"],
  },
  "cafe-worker": {
    id: "cafe-worker",
    displayName: "Ms. Sana",
    portrait: "👩🏽‍🍳",
    role: "the cheerful Sunny Café worker",
    personalityTraits: ["warm", "energetic", "creative"],
    favoriteTopics: ["food", "drinks", "café"],
    speakingStyle: "bubbly and helpful",
    homeLocation: "cafe",
    allowedIntents: [...commonIntents, "ask-cafe-food"],
    fallbackResponses: ["We can chat about treats, warm drinks, friends, or café fun!"],
  },
  "park-keeper": {
    id: "park-keeper",
    displayName: "Mr. Sami",
    portrait: "🧑🏽‍🌾",
    role: "the neighborhood park keeper",
    personalityTraits: ["calm", "thoughtful", "nature-loving"],
    favoriteTopics: ["flowers", "birds", "park"],
    speakingStyle: "calm and encouraging",
    homeLocation: "park",
    allowedIntents: [...commonIntents, "ask-park-plants"],
    fallbackResponses: ["We can talk about flowers, birds, picnics, or caring for the park!"],
  },
  "park-parent": {
    id: "park-parent",
    displayName: "Auntie Layla",
    portrait: "👩🏾‍🦱",
    role: "a caregiver enjoying the park",
    personalityTraits: ["gentle", "observant", "book-loving"],
    favoriteTopics: ["reading", "picnics", "friends"],
    speakingStyle: "soft and cheerful",
    homeLocation: "park",
    allowedIntents: commonIntents,
    fallbackResponses: ["We can talk about books, picnics, friends, or the playground!"],
  },
  shopkeeper: {
    id: "shopkeeper",
    displayName: "Mr. Kareem",
    portrait: "🧑🏾‍💼",
    role: "the helpful grocery shopkeeper",
    personalityTraits: ["helpful", "cheerful", "organized"],
    favoriteTopics: ["ingredients", "recipes", "shopping"],
    speakingStyle: "clear and upbeat",
    homeLocation: "grocery",
    allowedIntents: [...commonIntents, "ask-shop-ingredient"],
    fallbackResponses: ["We can talk about groceries, recipe ingredients, or packing a shopping bag!"],
  },
  "grocery-shopper": {
    id: "grocery-shopper",
    displayName: "Mrs. Huda",
    portrait: "👩🏽‍🦳",
    role: "a neighbor doing her shopping",
    personalityTraits: ["friendly", "curious", "thoughtful"],
    favoriteTopics: ["fruit", "neighbors", "shopping"],
    speakingStyle: "friendly and conversational",
    homeLocation: "grocery",
    allowedIntents: commonIntents,
    fallbackResponses: ["We can talk about fruit, shopping, recipes, or our neighborhood!"],
  },
};

