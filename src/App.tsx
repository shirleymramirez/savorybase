import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import AdminPanelSection from "./components/AdminPanelSection";
import FooterSection from "./components/FooterSection";
import HeaderSection from "./components/HeaderSection";
import ItemBuilderSection from "./components/ItemBuilderSection";
import MenuEntriesSection from "./components/MenuEntriesSection";
import { Category, DraftFoodItem, FoodItem } from "./types";

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
    image:
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
    image:
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
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
];

const emptyDraft: DraftFoodItem = {
  name: "",
  description: "",
  price: "18.00",
  categories: ["Main Course"],
  active: true,
  image:
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

function App() {
  const [items, setItems] = useState<FoodItem[]>(starterItems);
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2]);
  const [draft, setDraft] = useState<DraftFoodItem>(emptyDraft);
  const [bulkCategory, setBulkCategory] = useState<Category>("Seasonal");
  const [isDraggingImage, setIsDraggingImage] = useState(false);

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
        image: result,
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
        image: result,
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

  const handleSave = () => {
    const nextItem: FoodItem = {
      id: Date.now(),
      name: draft.name.trim() ? toTitleCase(draft.name.trim()) : "Untitled Dish",
      description: draft.description.trim() || "No description added yet.",
      price: Number(draft.price) || 0,
      categories: draft.categories,
      active: draft.active,
      stock: draft.active ? "In Stock" : "Sold Out",
      image: draft.image,
    };

    setItems((current) => [nextItem, ...current]);
    setDraft(emptyDraft);
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
            <AdminPanelSection
              selectedCount={selectedIds.length}
              bulkCategory={bulkCategory}
              categories={categories}
              lowStockCount={lowStockCount}
              selectedItems={selectedItems}
              onBulkCategoryChange={setBulkCategory}
              onApplyBulkCategory={applyBulkCategory}
              onApplyBulkStatus={applyBulkStatus}
            />

            <MenuEntriesSection
              items={items}
              selectedIds={selectedIds}
              onSelectAll={() => setSelectedIds(items.map((item) => item.id))}
              onToggleSelection={toggleSelection}
            />
          </aside>
        </main>

        <FooterSection />
      </div>
    </div>
  );
}

export default App;
