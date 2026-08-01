import type { NpcId } from "../../livingCharacters";
import type { DialogueContext } from "../../dialogue/DialogueController";
import type { DialogueIntent } from "../../dialogue/DialogueIntent";

export interface DialogueTopic {
  label: string;
  message: string;
  intent: DialogueIntent;
}

const common: readonly DialogueTopic[] = [
  { label: "Say hello", message: "Hello!", intent: "greeting" },
  { label: "What do you remember?", message: "What do you remember?", intent: "ask-memory" },
  { label: "Talk about friends", message: "Can we talk about friendship?", intent: "ask-friendship" },
];

export function topicSuggestions(npcId: NpcId, context: DialogueContext): DialogueTopic[] {
  const topics: DialogueTopic[] = [...common];

  if (context.locationId === "home") {
    topics.push(
      { label: "Help at home", message: "What can I help tidy or clean?", intent: "ask-help" },
      { label: "Make a recipe", message: "What pretend recipe could I make?", intent: "ask-recipe" },
      { label: "Read together", message: "Can we have story time?", intent: "ask-activity" },
    );
  } else if (context.locationId === "bedroom") {
    topics.push(
      { label: "Self-care idea", message: "What self-care activity can I try?", intent: "ask-help" },
      { label: "Cozy story", message: "Can we read a cozy story?", intent: "ask-activity" },
      { label: "Tidy the room", message: "What can I put away in the bedroom?", intent: "ask-help" },
    );
  } else if (context.locationId === "street") {
    topics.push(
      { label: "Scooter ride", message: "Where can I ride the scooter?", intent: "ask-activity" },
      { label: "Neighborhood help", message: "How can I be a kind neighbor?", intent: "ask-help" },
      { label: "Mailbox story", message: "Can we make a story about the mailbox?", intent: "ask-activity" },
    );
  } else if (context.locationId === "park") {
    topics.push(
      { label: "Ask about flowers", message: "How do we water the park plants?", intent: "ask-park-plants" },
      { label: "Plan a picnic", message: "What can we do for a picnic?", intent: "ask-activity" },
      { label: "Feed the birds", message: "How can we feed the birds?", intent: "ask-help" },
      { label: "Playground idea", message: "Which playground activity should I try?", intent: "ask-activity" },
    );
  } else if (context.locationId === "grocery") {
    topics.push(
      { label: "Find ingredients", message: "Can you help me find an ingredient?", intent: "ask-shop-ingredient" },
      { label: "Recipe idea", message: "Can you suggest a recipe?", intent: "ask-recipe" },
      { label: "Pack a bag", message: "How do I pack a shopping bag?", intent: "ask-help" },
      { label: "Shopping story", message: "What could be on my shopping list?", intent: "ask-activity" },
    );
  } else if (npcId === "cafe-worker") {
    topics.push(
      { label: "Café treats", message: "What food and drinks are here?", intent: "ask-cafe-food" },
      { label: "Warm drink", message: "How do I order a warm drink?", intent: "ask-help" },
      { label: "Help the café", message: "How can I help at the café?", intent: "ask-activity" },
    );
  } else {
    topics.push({ label: "Something fun", message: "What can we do here?", intent: "ask-activity" });
  }

  if (context.heldItemId) {
    topics.unshift({
      label: "Ask about my item",
      message: `What do you think about my ${context.heldItemId}?`,
      intent: "ask-item",
    });
  }

  return topics.slice(0, context.relationshipLevel >= 2 ? 7 : 6);
}
