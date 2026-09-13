import type { ElementType } from "react";
import {
  Shirt,
  Baby,
  Sparkles,
  Headphones,
  Sprout,
  UtensilsCrossed,
  Tent,
  Tag,
  BookOpen,
  Footprints,
  Sofa,
  Dumbbell,
  PenLine,
} from "lucide-react";

export const categoryIcons: Record<string, ElementType> = {
  apparel: Shirt,
  baby: Baby,
  beauty: Sparkles,
  electronics: Headphones,
  "home & living": Sprout,
  kitchen: UtensilsCrossed,
  outdoors: Tent,
  clothes: Shirt,
  clothing: Shirt,
  shoes: Footprints,
  footwear: Footprints,
  furniture: Sofa,
  "books & gallery": BookOpen,
  "books and gallery": BookOpen,
  books: BookOpen,
  "sports and outdoors": Dumbbell,
  "sports & outdoors": Dumbbell,
  sports: Dumbbell,
  "stationery items": PenLine,
  stationery: PenLine,
};

// ordered keyword fallbacks so close variants ("Sports & Outdoors Gear",
// "Stationery") still resolve to a sensible icon even if they don't exactly
// match a key above
const keywordIcons: [string, ElementType][] = [
  ["book", BookOpen],
  ["shoe", Footprints],
  ["footwear", Footprints],
  ["sneaker", Footprints],
  ["furniture", Sofa],
  ["sofa", Sofa],
  ["sport", Dumbbell],
  ["outdoor", Dumbbell],
  ["fitness", Dumbbell],
  ["gym", Dumbbell],
  ["station", PenLine],
  ["cloth", Shirt],
  ["apparel", Shirt],
  ["fashion", Shirt],
  ["beauty", Sparkles],
  ["cosmetic", Sparkles],
  ["electronic", Headphones],
  ["tech", Headphones],
  ["gadget", Headphones],
  ["kitchen", UtensilsCrossed],
  ["home", Sprout],
  ["living", Sprout],
  ["baby", Baby],
];

export function getCategoryIcon(name: string) {
  const normalized = name.trim().toLowerCase();
  if (categoryIcons[normalized]) return categoryIcons[normalized];

  const match = keywordIcons.find(([keyword]) => normalized.includes(keyword));
  return match ? match[1] : Tag;
}