export type Category =
  | "Appetizer"
  | "Main Course"
  | "Dessert"
  | "Vegan"
  | "Gluten-Free"
  | "Seasonal"
  | "Chef Special";

export type FoodItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  categories: Category[];
  active: boolean;
  stock: "In Stock" | "Low Stock" | "Sold Out";
  image: string;
};

export type DraftFoodItem = {
  name: string;
  description: string;
  price: string;
  categories: Category[];
  active: boolean;
  image: string;
  cropZoom: number;
  cropX: number;
  cropY: number;
};
