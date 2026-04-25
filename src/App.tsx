import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import AdminPanelSection from "./components/AdminPanelSection";
import FooterSection from "./components/FooterSection";
import HeaderSection from "./components/HeaderSection";
import ItemBuilderSection from "./components/ItemBuilderSection";
import MenuEntriesSection from "./components/MenuEntriesSection";
import { Category, DraftFoodItem, FoodItem } from "./types";

const FOODS_API_URL = "/api/foods";
type FoodApiPayload = Omit<FoodItem, "id" | "categories"> & { category: Category };

const categories: Category[] = [
  "Appetizer",
  "Main Course",
  "Dessert",
  "Vegan",
  "Gluten-Free",
  "Seasonal",
  "Chef Special",
];

const starterItems: FoodItem[] = [
  {
    id: 1,
    name: "Roasted Cauliflower Tacos",
    description: "Tahini slaw, charred scallion salsa, pickled onions.",
    price: 14,
    categories: ["Main Course", "Vegan", "Chef Special"],
    active: true,
    stock: "In Stock",
    imageUrl:
      "https://images.unsplash.com/photo-1611250188496-e966043a0629?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Citrus Burrata Plate",
    description: "Burrata with blood orange, pistachio and herb oil.",
    price: 12,
    categories: ["Appetizer", "Seasonal"],
    active: true,
    stock: "Low Stock",
    imageUrl:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Charcoal Lemon Tart",
    description: "Silky citrus curd with almond crust and sea salt.",
    price: 9,
    categories: ["Dessert"],
    active: false,
    stock: "Sold Out",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
];

const emptyDraft: DraftFoodItem = {
  name: "",
  description: "",
  price: "18.00",
  categories: ["Main Course"],
  active: true,
  imageUrl:
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  cropZoom: 110,
  cropX: 50,
  cropY: 50,
};

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readImageFile(file: File, onLoad: (result: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    onLoad(String(reader.result));
  };
  reader.readAsDataURL(file);
}

function buildFoodPayload(draft: DraftFoodItem) {
  const name = draft.name.trim() ? toTitleCase(draft.name.trim()) : "Untitled Dish";
  const description = draft.description.trim() || "No description added yet.";
  const price = Number(draft.price) || 0;
  const active = draft.active;
  const category = draft.categories[0] ?? "Main Course";
  const stock: FoodItem["stock"] = active ? "In Stock" : "Sold Out";

  return {
    name,
    description,
    price,
    category,
    active,
    stock,
    imageUrl: draft.imageUrl,
  } satisfies FoodApiPayload;
}

function normalizeFoodItem(food: Partial<FoodItem> & { category?: Category }, fallback: FoodApiPayload): FoodItem {
  const normalizedCategories =
    Array.isArray(food.categories) && food.categories.length > 0
      ? (food.categories as Category[])
      : food.category
        ? [food.category]
        : fallback.category
          ? [fallback.category]
          : (["Main Course"] as Category[]);

  return {
    id: typeof food.id === "number" ? food.id : Date.now(),
    name: typeof food.name === "string" && food.name.trim() ? food.name : fallback.name,
    description:
      typeof food.description === "string" && food.description.trim()
        ? food.description
        : fallback.description,
    price: typeof food.price === "number" ? food.price : fallback.price,
    categories: normalizedCategories,
    active: typeof food.active === "boolean" ? food.active : fallback.active,
    stock:
      food.stock === "In Stock" || food.stock === "Low Stock" || food.stock === "Sold Out"
        ? food.stock
        : fallback.stock,
    imageUrl: typeof food.imageUrl === "string" && food.imageUrl ? food.imageUrl : fallback.imageUrl,
  };
}

function App() {
  const [items, setItems] = useState<FoodItem[]>(starterItems);
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2]);
  const [draft, setDraft] = useState<DraftFoodItem>(emptyDraft);
  const [bulkCategory, setBulkCategory] = useState<Category>("Seasonal");
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [saveItemError, setSaveItemError] = useState<string | null>(null);

  const activeCount = items.filter((item) => item.active).length;
  const lowStockCount = items.filter((item) => item.stock !== "In Stock").length;
  const averagePrice = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    return total / items.length;
  }, [items]);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    readImageFile(file, (result) => {
      setDraft((current) => ({
        ...current,
        imageUrl: result,
      }));
    });
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingImage(false);

    const file = event.dataTransfer.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    readImageFile(file, (result) => {
      setDraft((current) => ({
        ...current,
        imageUrl: result,
      }));
    });
  };

  const toggleCategory = (category: Category) => {
    setDraft((current) => {
      const exists = current.categories.includes(category);
      return {
        ...current,
        categories: exists
          ? current.categories.filter((entry) => entry !== category)
          : [...current.categories, category],
      };
    });
  };

  const handleSave = async () => {
    const payload = buildFoodPayload(draft);

    setIsSavingItem(true);
    setSaveItemError(null);

    try {
      const response = await fetch(FOODS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Unauthorized. Set a valid API_AUTH_TOKEN in .env and restart the Vite dev server.",
          );
        }

        if (response.status === 400) {
          const errorPayload = (await response.json()) as {
            message?: string;
            error?: Array<{ field?: string; message?: string }>;
          };
          const validationMessage = errorPayload.error?.[0]?.message || errorPayload.message;

          throw new Error(validationMessage || "Validation failed.");
        }

        throw new Error(`Request failed with status ${response.status}`);
      }

      const createdFood = (await response.json()) as Partial<FoodItem> & { category?: Category };
      const nextItem = normalizeFoodItem(createdFood, payload);

      setItems((current) => [nextItem, ...current]);
      setDraft(emptyDraft);
    } catch (error) {
      setSaveItemError(
        error instanceof Error ? error.message : "Unable to save this food item right now.",
      );
    } finally {
      setIsSavingItem(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  const applyBulkStatus = (active: boolean) => {
    setItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              active,
              stock: active ? "In Stock" : "Sold Out",
            }
          : item,
      ),
    );
  };

  const applyBulkCategory = () => {
    setItems((current) =>
      current.map((item) =>
        selectedIds.includes(item.id)
          ? {
              ...item,
              categories: item.categories.includes(bulkCategory)
                ? item.categories
                : [...item.categories, bulkCategory],
            }
          : item,
      ),
    );
  };

  const updateItem = (
    id: number,
    updates: Pick<FoodItem, "name" | "description" | "price" | "categories" | "active">,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              stock: updates.active
                ? item.stock === "Sold Out"
                  ? "In Stock"
                  : item.stock
                : "Sold Out",
            }
          : item,
      ),
    );
  };

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  return (
    <div className="min-h-screen bg-mist-50 text-mist-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <HeaderSection
          itemCount={items.length}
          activeCount={activeCount}
          averagePrice={averagePrice}
        />

        <main className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <ItemBuilderSection
            draft={draft}
            categories={categories}
            isDraggingImage={isDraggingImage}
            isSaving={isSavingItem}
            saveError={saveItemError}
            onReset={() => setDraft(emptyDraft)}
            onSave={handleSave}
            onImageSelect={handleImageSelect}
            onImageDrop={handleImageDrop}
            onImageDragOver={(event) => {
              event.preventDefault();
              setIsDraggingImage(true);
            }}
            onImageDragLeave={() => setIsDraggingImage(false)}
            onNameChange={(value) =>
              setDraft((current) => ({
                ...current,
                name: toTitleCase(value),
              }))
            }
            onDescriptionChange={(value) =>
              setDraft((current) => ({ ...current, description: value }))
            }
            onPriceChange={(value) => setDraft((current) => ({ ...current, price: value }))}
            onToggleCategory={toggleCategory}
            onToggleActive={() =>
              setDraft((current) => ({
                ...current,
                active: !current.active,
              }))
            }
            onCropZoomChange={(value) => setDraft((current) => ({ ...current, cropZoom: value }))}
            onCropXChange={(value) => setDraft((current) => ({ ...current, cropX: value }))}
            onCropYChange={(value) => setDraft((current) => ({ ...current, cropY: value }))}
          />

          <aside className="space-y-6">
            <MenuEntriesSection
              items={items}
              selectedIds={selectedIds}
              onSelectAll={() => setSelectedIds(items.map((item) => item.id))}
              onDeselectAll={() => setSelectedIds([])}
              onToggleSelection={toggleSelection}
            />
            <AdminPanelSection
              selectedCount={selectedIds.length}
              bulkCategory={bulkCategory}
              categories={categories}
              lowStockCount={lowStockCount}
              selectedItems={selectedItems}
              onBulkCategoryChange={setBulkCategory}
              onApplyBulkCategory={applyBulkCategory}
              onApplyBulkStatus={applyBulkStatus}
              onUpdateItem={updateItem}
            />
          </aside>
        </main>

        <FooterSection />
      </div>
    </div>
  );
}

export default App;
