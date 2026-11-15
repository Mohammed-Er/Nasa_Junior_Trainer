/**
 * ARES: The Last Signal - Daily Rations & Rotating Menus
 * Based on real NASA space food systems (ISS & Artemis space food development).
 */

export const RATIONS = [
  {
    id: "full",
    label: "Full Meals",
    shortDesc: "Hot meal pouch + full water bottle",
    desc: "A hot meal pouch and a full bottle of water for each astronaut.",
    crewQuote: "Dr. Reed: Full rations keep the crew strong, alert, and smiling.",
    deltas: { lifeSupport: -3, morale: 4 }
  },
  {
    id: "light",
    label: "Half Meals",
    shortDesc: "Smaller meal + half water bottle",
    desc: "A smaller meal pouch and half a bottle of water for each astronaut.",
    crewQuote: "Dr. Reed: We can manage on half rations, but energy drops over time.",
    deltas: { lifeSupport: -2, morale: -2 }
  },
  {
    id: "emergency",
    label: "Snack Bars Only",
    shortDesc: "One energy bar + sips of water",
    desc: "One high-calorie snack bar and a few sips of water for each astronaut.",
    crewQuote: "Dr. Reed: Severe cuts preserve water, but crew morale will plummet fast.",
    deltas: { lifeSupport: -1, morale: -6 }
  }
];

export const MENUS = [
  {
    sol: 1,
    breakfast: "Oatmeal with dried blueberries and apple cinnamon drink",
    mainMeal: "Chicken and brown rice pouch with warm flour tortilla",
    snack: "Roasted almonds and freeze-dried strawberries",
    nasaFact: "Astronauts use tortillas instead of bread because bread crumbs float and clog air filters!"
  },
  {
    sol: 2,
    breakfast: "Scrambled eggs pouch with Mexican salsa",
    mainMeal: "Beef brisket pouch, green beans, and mango peach smoothie",
    snack: "Granola bar and dried peaches",
    nasaFact: "Food pouches on space missions are heated in a small suitcase-sized food warmer."
  },
  {
    sol: 3,
    breakfast: "Granola with dried whole milk and orange drink",
    mainMeal: "Sweet and sour chicken with white rice pouch",
    snack: "Peanut butter pouch and honey graham crackers",
    nasaFact: "Salt and pepper in space are liquid drops so grains do not float into astronaut eyes."
  },
  {
    sol: 4,
    breakfast: "Freeze-dried breakfast skillet with peppers and onions",
    mainMeal: "Tuna salad spread with whole wheat tortilla and lemon drink",
    snack: "Cashews and dried apricots",
    nasaFact: "Astronauts often lose some sense of smell in space, so they love spicy sauce to taste food better."
  },
  {
    sol: 5,
    breakfast: "Apple-cranberry oatmeal and warm chocolate drink",
    mainMeal: "Turkey chili pouch with sweet corn",
    snack: "Sunflower seeds and freeze-dried pear slices",
    nasaFact: "Freeze-drying takes out 98% of water, making space food super light to launch into space."
  },
  {
    sol: 6,
    breakfast: "Berry yogurt pouch with crunchy granola",
    mainMeal: "Pasta with marinara sauce and parmesan pouch",
    snack: "Trail mix with dried cranberries",
    nasaFact: "Every astronaut gets to pick some of their favorite menu items before leaving Earth."
  },
  {
    sol: 7,
    breakfast: "Vegetable omelet with warm spiced cider",
    mainMeal: "Salmon fillet pouch with buttered noodles",
    snack: "Dried banana chips and dark chocolate bites",
    nasaFact: "Water added to dried food packets comes directly from the spacecraft's water recycling system."
  },
  {
    sol: 8,
    breakfast: "Cinnamon grain cereal with powdered milk",
    mainMeal: "Barbecue beef with baked beans pouch",
    snack: "Walnuts and dried pineapple chunks",
    nasaFact: "Astronaut meal trays have magnets and velcro straps to stop forks and spoons from floating away."
  },
  {
    sol: 9,
    breakfast: "Peach-mango oatmeal pouch with hot tea",
    mainMeal: "Curried rice with lentils and flatbread",
    snack: "Pecan halves and dried apple rings",
    nasaFact: "Space nutritionists plan menus so astronauts get the exact right vitamins to protect their bones."
  },
  {
    sol: 10,
    breakfast: "Celebration breakfast: Strawberry pancakes with maple syrup pouch",
    mainMeal: "Roast turkey with mashed potatoes and cranberry sauce pouch",
    snack: "Holiday fruit cocktail pouch and butter cookies",
    nasaFact: "Sharing special holiday meals together boosts astronaut mood and team closeness on long voyages."
  },
  {
    sol: 11,
    breakfast: "Blueberry granola clusters and tropical juice",
    mainMeal: "Chicken fajita pouch with salsa and warm tortilla",
    snack: "Pumpkin seeds and freeze-dried kiwi slices",
    nasaFact: "Fresh produce like carrots and apples is a huge treat when cargo resupply ships dock."
  },
  {
    sol: 12,
    breakfast: "Scrambled eggs with bacon bits pouch",
    mainMeal: "Hearty vegetable minestrone soup with breadsticks",
    snack: "Mixed nuts and dried figs",
    nasaFact: "Food packages have barcode stickers so astronauts can scan what they eat into a computer."
  }
];

export function getMenuForSol(sol) {
  const index = (sol - 1) % MENUS.length;
  return MENUS[index];
}
