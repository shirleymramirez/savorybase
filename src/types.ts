export type Category =
  | "Appetizer"
  | "Main Course"
  | "Dessert"
  | "Vegan"
  | "Seasonal"
  | "Chef Special";

export type FoodItem = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  categories: Category[];
  active: boolean;
  inventoryAvailable: number;
  originalInventory: number;
  remainingInventory: number;
  stock: "In Stock" | "Low Stock" | "Sold Out";
  imageUrl: string;
};

export type DraftFoodItem = {
  name: string;
  description: string;
  price: string;
  categories: Category[];
  active: boolean;
  inventoryAvailable: string;
  originalInventory: string;
  remainingInventory: string;
  imageUrl: string;
  imageFile: File | null;
};
