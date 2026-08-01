import type { DialogueIntent } from "../../dialogue/DialogueIntent";

export const DIALOGUE_TEMPLATES: Record<DialogueIntent, readonly string[]> = {
  greeting: [
    "Hello, {playerName}! It is lovely to see you.",
    "Hello again, {playerName}! What shall we talk about?",
    "Hi, {playerName}! Are you making a new neighborhood story today?",
  ],
  goodbye: [
    "See you soon! Have a lovely time in {locationName}.",
    "Goodbye for now, {playerName}!",
    "Bye! I cannot wait to hear about your next adventure.",
  ],
  "ask-name": ["My name is {npcName}. I am happy to meet you!"],
  "ask-role": ["I am {npcRole}."],
  "ask-current-location": [
    "We are in {locationName}. A lovely place for {activityName}!",
    "{locationName} has lots of little story ideas. We could try {activityName}.",
  ],
  "ask-other-location": ["You can use the friendly map above to visit {itemName}."],
  "ask-character": ["{itemName} is part of our friendly neighborhood story."],
  "ask-item": [
    "I can see the {itemName}. It might be useful for our next activity!",
    "The {itemName} could become part of a kind, funny, or helpful story.",
  ],
  "ask-food": [
    "A {itemName} sounds tasty. We can eat together or save it for a picnic!",
    "That {itemName} could be a snack, a café treat, or part of a pretend recipe.",
  ],
  "ask-recipe": [
    "Try bread and cheese for a sandwich, or fruit in the mixing bowl.",
    "You could make toast, warm tea, a fruit bowl, or a pretend cake.",
  ],
  "ask-activity": [
    "How about {activityName}? We can make a little story together.",
    "We could try {activityName}, then add our own characters and ending.",
    "The Adventure Book has ideas too, but free play is always welcome.",
  ],
  "ask-help": [
    "Start with one small thing: {activityName}. I can cheer you on!",
    "Look for a glowing interaction hint, then try one helpful step at a time.",
  ],
  "ask-memory": ["{memoryItem}"],
  compliment: [
    "That is very kind, {playerName}! You made me smile.",
    "Thank you, {playerName}. Kind words make our neighborhood brighter.",
  ],
  "express-happiness": [
    "I am glad you feel happy! Let's do something cheerful together.",
    "That happy feeling could become a wonderful little story.",
  ],
  "express-sadness": [
    "I am sorry you feel sad. We can rest, read, or find a family member nearby.",
    "We can take things gently. A quiet seat, story, or friendly chat might help.",
  ],
  "express-excitement": [
    "How exciting! {activityName} would be wonderful right now.",
    "That sounds like Adventure Book energy! Let us make the story our own.",
  ],
  "express-tiredness": [
    "A cozy seat or a quiet story might feel nice.",
    "Rest is part of a good day too. We can slow down together.",
  ],
  "ask-friendship": [
    "We are {friendshipPhrase}. Kind words and shared activities help friendship grow.",
    "Friendship grows when we listen, help, share, and make happy memories.",
  ],
  "mention-gift": ["Gifts are a kind surprise. {memoryItem}"],
  "mention-shared-activity": ["{memoryItem}"],
  "ask-shop-ingredient": [
    "For a sandwich, look for bread and cheese. For fruit bowls, choose apples and bananas.",
    "Start with a basket, choose a few pretend groceries, then take them to checkout.",
  ],
  "ask-park-plants": [
    "Flowers like gentle watering. The watering can is near the planters.",
    "The park also needs kind helpers for the birds and little tidy-up jobs.",
  ],
  "ask-cafe-food": [
    "The café has cupcakes, sandwiches, and warm drinks to enjoy.",
    "You can order a treat, make a warm-drink story, or help return a dish.",
  ],
  "safe-redirect": [
    "Let's talk about something safe and fun in Khadija's World. Would you like the park or a snack?",
    "We can keep our story kind and safe. Try asking about friends, food, nature, or an activity.",
  ],
  unknown: [
    "I'm not sure about that, but we can talk about the park, our friends, food, or something fun to do!",
    "Tell me another way, or ask for an Adventure Book idea.",
  ],
};
