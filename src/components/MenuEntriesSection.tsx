import { useEffect, useState } from "react";
import { Category, FoodItem } from "../types";

const FOODS_API_URL = "/api/foods";

type MenuEntriesSectionProps = {
  items: FoodItem[];
  onItemsChange: (items: FoodItem[]) => void;
  selectedIds: Array<string | number>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onToggleSelection: (id: string | number) => void;
};

type FoodApiResponse =
  | Array<Partial<FoodItem> & { category?: Category; _id?: string }>
  | {
      data?: Array<Partial<FoodItem> & { category?: Category; _id?: string }>;
      foods?: Array<Partial<FoodItem> & { category?: Category; _id?: string }>;
      items?: Array<Partial<FoodItem> & { category?: Category; _id?: string }>;
    };

function normalizeFoodItem(
  food: Partial<FoodItem> & { category?: Category; _id?: string },
  fallbackId: string | number,
): FoodItem {
  const categories =
    Array.isArray(food.categories) && food.categories.length > 0
      ? (food.categories as Category[])
      : food.category
        ? [food.category]
        : (["Main Course"] as Category[]);
  const active = typeof food.active === "boolean" ? food.active : true;

  return {
    id:
      typeof food.id === "string" || typeof food.id === "number"
        ? food.id
        : typeof food._id === "string"
          ? food._id
          : fallbackId,
    name: typeof food.name === "string" && food.name.trim() ? food.name : "Untitled Dish",
    description:
      typeof food.description === "string" && food.description.trim()
        ? food.description
        : "No description added yet.",
    price: typeof food.price === "number" ? food.price : 0,
    categories,
    active,
    stock:
      food.stock === "In Stock" || food.stock === "Low Stock" || food.stock === "Sold Out"
        ? food.stock
        : active
          ? "In Stock"
          : "Sold Out",
    imageUrl:
      typeof food.imageUrl === "string" && food.imageUrl
        ? food.imageUrl
        : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  };
}

function extractFoodItems(payload: FoodApiResponse) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.foods)) {
    return payload.foods;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}

function MenuEntriesSection({
  items,
  onItemsChange,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onToggleSelection,
}: MenuEntriesSectionProps) {
  const [menuItems, setMenuItems] = useState<FoodItem[]>(items);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const allItemsSelected = menuItems.length > 0 && selectedIds.length === menuItems.length;

  useEffect(() => {
    setMenuItems(items);
  }, [items]);

  useEffect(() => {
    let ignore = false;

    async function fetchMenuItems() {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetch(FOODS_API_URL, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as FoodApiResponse;
        const normalizedItems = extractFoodItems(payload).map((item, index) =>
          normalizeFoodItem(item, `fallback-${index + 1}`),
        );

        if (ignore) {
          return;
        }

        setMenuItems(normalizedItems);
        onItemsChange(normalizedItems);
      } catch (error) {
        if (ignore) {
          return;
        }

        setFetchError(
          error instanceof Error ? error.message : "Unable to load menu entries right now.",
        );
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void fetchMenuItems();

    return () => {
      ignore = true;
    };
  }, [onItemsChange]);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Menu Entries</p>
          <h2 className="mt-2 font-serif text-3xl text-mist-900">Current Items</h2>
        </div>
        {allItemsSelected ? (
          <button
            type="button"
            className="text-sm font-medium text-mist-600 transition hover:text-mist-900"
            onClick={onDeselectAll}
          >
            Deselect All
          </button>
        ) : (
          <button
            type="button"
            className="text-sm font-medium text-mist-600 transition hover:text-mist-900"
            onClick={onSelectAll}
          >
            Select All
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-[24px] border border-mist-200 bg-mist-50 px-4 py-6 text-sm text-mist-600">
          Loading menu entries...
        </div>
      ) : fetchError ? (
        <div className="mt-5 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
          {fetchError}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {menuItems.map((item) => {
            const selected = selectedIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleSelection(item.id)}
                className={`grid w-full gap-4 rounded-[24px] border p-3 text-left transition sm:grid-cols-[auto_1fr_auto] sm:items-center ${
                  selected
                    ? "border-mist-900 bg-mist-100"
                    : "border-mist-200 bg-mist-50 hover:border-mist-400"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                      selected
                        ? "border-mist-900 bg-mist-900 text-white"
                        : "border-mist-300 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-16 rounded-[20px] object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-mist-900">{item.name}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                        item.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-mist-200 text-mist-700"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-mist-600">{item.description}</p>
                  <p className="mt-2 text-xs text-mist-500">{item.categories.join(" • ")}</p>
                </div>

                <div className="flex items-center justify-between sm:block sm:text-right">
                  <p className="text-base font-semibold text-mist-900">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-mist-500">{item.stock}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MenuEntriesSection;
