export type EntityKind = "character" | "location" | "item" | "activity" | "emotion";

export interface EntityAliasDefinition {
  id: string;
  label: string;
  kind: EntityKind;
  aliases: readonly string[];
}

export const ENTITY_ALIASES: readonly EntityAliasDefinition[] = [
  { id: "khadija", label: "Khadija", kind: "character", aliases: ["khadija"] },
  { id: "sister", label: "little sister", kind: "character", aliases: ["sister", "little sister", "younger sister"] },
  { id: "brother", label: "brother", kind: "character", aliases: ["brother"] },
  { id: "parent", label: "Mama", kind: "character", aliases: ["mama", "mum", "mom", "guardian", "parent"] },
  { id: "neighbor", label: "Auntie Noor", kind: "character", aliases: ["auntie noor", "auntie", "neighbor", "neighbour"] },
  { id: "cafe-worker", label: "Ms. Sana", kind: "character", aliases: ["ms sana", "sana", "barista", "cafe worker"] },
  { id: "park-keeper", label: "Mr. Sami", kind: "character", aliases: ["mr sami", "sami", "park keeper", "gardener"] },
  { id: "park-parent", label: "Auntie Layla", kind: "character", aliases: ["auntie layla", "layla", "caregiver"] },
  { id: "shopkeeper", label: "Mr. Kareem", kind: "character", aliases: ["mr kareem", "kareem", "shopkeeper", "cashier"] },
  { id: "grocery-shopper", label: "Mrs. Huda", kind: "character", aliases: ["mrs huda", "huda", "shopper"] },

  { id: "home", label: "family home", kind: "location", aliases: ["home", "family home", "house"] },
  { id: "bedroom", label: "Khadija's bedroom", kind: "location", aliases: ["bedroom", "room"] },
  { id: "street", label: "neighborhood street", kind: "location", aliases: ["street", "neighborhood", "neighbourhood"] },
  { id: "cafe", label: "Sunny Café", kind: "location", aliases: ["cafe", "café", "sunny cafe", "coffee shop"] },
  { id: "park", label: "neighborhood park", kind: "location", aliases: ["park", "playground", "garden"] },
  { id: "grocery", label: "grocery shop", kind: "location", aliases: ["grocery", "grocery shop", "shop", "store", "market"] },

  { id: "teddy", label: "teddy", kind: "item", aliases: ["teddy", "bear", "teddy bear"] },
  { id: "book", label: "book", kind: "item", aliases: ["book", "books", "story"] },
  { id: "cup", label: "cup", kind: "item", aliases: ["cup", "mug"] },
  { id: "apple", label: "apple", kind: "item", aliases: ["apple", "apples"] },
  { id: "cupcake", label: "cupcake", kind: "item", aliases: ["cupcake", "cupcakes", "cake"] },
  { id: "sandwich", label: "sandwich", kind: "item", aliases: ["sandwich", "sandwiches"] },
  { id: "juice", label: "juice", kind: "item", aliases: ["juice", "fruit juice"] },
  { id: "tea", label: "tea", kind: "item", aliases: ["tea", "warm tea"] },
  { id: "bread", label: "bread", kind: "item", aliases: ["bread", "loaf"] },
  { id: "cheese", label: "cheese", kind: "item", aliases: ["cheese"] },
  { id: "fruit", label: "fruit", kind: "item", aliases: ["fruit", "fruits", "berries", "banana"] },
  { id: "vegetables", label: "vegetables", kind: "item", aliases: ["vegetable", "vegetables", "veggies"] },
  { id: "flowers", label: "flowers", kind: "item", aliases: ["flower", "flowers", "plant", "plants"] },
  { id: "backpack", label: "backpack", kind: "item", aliases: ["backpack", "bag"] },
  { id: "basket", label: "shopping basket", kind: "item", aliases: ["basket", "shopping basket"] },
  { id: "shopping-bag", label: "shopping bag", kind: "item", aliases: ["shopping bag", "grocery bag"] },
  { id: "cleaning", label: "cleaning things", kind: "item", aliases: ["soap", "sponge", "cloth", "cleaning item"] },
  { id: "toys", label: "toys", kind: "item", aliases: ["toy", "toys", "ball", "scooter"] },
  { id: "gift", label: "gift", kind: "item", aliases: ["gift", "present"] },

  { id: "reading", label: "reading", kind: "activity", aliases: ["read", "reading", "story time"] },
  { id: "cooking", label: "cooking", kind: "activity", aliases: ["cook", "cooking", "make food"] },
  { id: "shopping", label: "shopping", kind: "activity", aliases: ["shop", "shopping", "buy"] },
  { id: "eating", label: "eating", kind: "activity", aliases: ["eat", "eating", "snack"] },
  { id: "drinking", label: "drinking", kind: "activity", aliases: ["drink", "drinking", "sip"] },
  { id: "playing", label: "playing", kind: "activity", aliases: ["play", "playing", "game"] },
  { id: "picnicking", label: "having a picnic", kind: "activity", aliases: ["picnic", "picnicking"] },
  { id: "cleaning", label: "cleaning", kind: "activity", aliases: ["clean", "cleaning", "tidy", "tidying"] },
  { id: "watering-plants", label: "watering plants", kind: "activity", aliases: ["water plants", "watering flowers", "watering plants"] },
  { id: "riding-scooter", label: "riding the scooter", kind: "activity", aliases: ["scooter", "riding scooter"] },
  { id: "sitting", label: "sitting", kind: "activity", aliases: ["sit", "sitting"] },
  { id: "sleeping", label: "sleeping", kind: "activity", aliases: ["sleep", "sleeping", "rest"] },
  { id: "giving-gifts", label: "giving gifts", kind: "activity", aliases: ["give a gift", "giving gifts"] },
  { id: "helping", label: "helping", kind: "activity", aliases: ["help", "helping"] },

  { id: "happy", label: "happy", kind: "emotion", aliases: ["happy", "glad", "good"] },
  { id: "excited", label: "excited", kind: "emotion", aliases: ["excited", "amazing", "wow"] },
  { id: "sad", label: "sad", kind: "emotion", aliases: ["sad", "upset", "unhappy"] },
  { id: "sleepy", label: "sleepy", kind: "emotion", aliases: ["sleepy", "tired", "yawn"] },
  { id: "surprised", label: "surprised", kind: "emotion", aliases: ["surprised", "shocked"] },
  { id: "curious", label: "curious", kind: "emotion", aliases: ["curious", "wondering"] },
  { id: "friendly", label: "friendly", kind: "emotion", aliases: ["friendly", "kind", "nice"] },
] as const;

