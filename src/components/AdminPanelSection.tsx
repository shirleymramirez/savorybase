import { useEffect, useState } from "react";
import { Category, FoodItem } from "../types";

type AdminPanelSectionProps = {
  selectedCount: number;
  bulkCategory: Category;
  categories: Category[];
  lowStockCount: number;
  selectedItems: FoodItem[];
  onBulkCategoryChange: (value: Category) => void;
  onApplyBulkCategory: () => void;
  onApplyBulkStatus: (active: boolean) => void;
  onUpdateItem: (
    id: string | number,
    updates: Pick<FoodItem, "name" | "description" | "price" | "categories" | "active">,
  ) => void;
};

type EditDraft = {
  id: string | number;
  name: string;
  description: string;
  price: string;
  category: Category;
  active: boolean;
};

function AdminPanelSection({
  selectedCount,
  bulkCategory,
  categories,
  lowStockCount,
  selectedItems,
  onBulkCategoryChange,
  onApplyBulkCategory,
  onApplyBulkStatus,
  onUpdateItem,
}: AdminPanelSectionProps) {
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);

  useEffect(() => {
    if (!editDraft) {
      return;
    }

    const currentItem = selectedItems.find((item) => item.id === editDraft.id);

    if (!currentItem) {
      setEditDraft(null);
      return;
    }

    setEditDraft({
      id: currentItem.id,
      name: currentItem.name,
      description: currentItem.description,
      price: currentItem.price.toFixed(2),
      category: currentItem.categories[0] ?? categories[0],
      active: currentItem.active,
    });
  }, [categories, editDraft?.id, selectedItems]);

  const openEditor = (item: FoodItem) => {
    setEditDraft({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toFixed(2),
      category: item.categories[0] ?? categories[0],
      active: item.active,
    });
  };

  const closeEditor = () => {
    setEditDraft(null);
  };

  const saveEditor = () => {
    if (!editDraft) {
      return;
    }

    onUpdateItem(editDraft.id, {
      name: editDraft.name.trim() || "Untitled Dish",
      description: editDraft.description.trim() || "No description added yet.",
      price: Number(editDraft.price) || 0,
      categories: [editDraft.category],
      active: editDraft.active,
    });

    closeEditor();
  };

  return (
    <>
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Admin Panel</p>
            <h2 className="mt-2 font-serif text-3xl text-mist-900">Update Items</h2>
          </div>
          <span className="rounded-full bg-mist-100 px-3 py-1 text-xs font-medium text-mist-700">
            {selectedCount} selected
          </span>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-mist-500">
            Selected Preview
          </h3>
          <div className="mt-3 space-y-3">
            {selectedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openEditor(item)}
                className="flex w-full items-center gap-3 rounded-2xl border border-mist-200 bg-mist-50 p-3 text-left transition hover:border-mist-400 hover:bg-white"
              >
                <img src={item.imageUrl} alt={item.name} fetchPriority="high" loading="eager" className="h-14 w-14 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-mist-900">{item.name}</p>
                  <p className="truncate text-xs text-mist-600">{item.categories.join(" • ")}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {editDraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-mist-900/55 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/70 bg-white p-6 shadow-soft sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Edit Item</p>
                <h3 className="mt-2 font-serif text-3xl text-mist-900">Update Menu Entry</h3>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-mist-700 transition hover:border-mist-500 hover:text-mist-900"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-mist-700">Name</span>
                <input
                  value={editDraft.name}
                  onChange={(event) =>
                    setEditDraft((current) =>
                      current ? { ...current, name: event.target.value } : current,
                    )
                  }
                  className="w-full rounded-2xl border border-mist-200 bg-mist-50 px-4 py-3 text-base text-mist-900 outline-none transition focus:border-mist-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-mist-700">Description</span>
                <textarea
                  value={editDraft.description}
                  onChange={(event) =>
                    setEditDraft((current) =>
                      current ? { ...current, description: event.target.value } : current,
                    )
                  }
                  className="min-h-28 w-full resize-none rounded-2xl border border-mist-200 bg-mist-50 px-4 py-3 text-base text-mist-900 outline-none transition focus:border-mist-500"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-mist-700">Price</span>
                  <div className="flex rounded-2xl border border-mist-200 bg-mist-50 focus-within:border-mist-500">
                    <span className="flex items-center px-4 text-mist-500">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editDraft.price}
                      onChange={(event) =>
                        setEditDraft((current) =>
                          current ? { ...current, price: event.target.value } : current,
                        )
                      }
                      className="w-full rounded-r-2xl bg-transparent py-3 pr-4 text-base text-mist-900 outline-none"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-mist-700">Category</span>
                  <select
                    value={editDraft.category}
                    onChange={(event) =>
                      setEditDraft((current) =>
                        current ? { ...current, category: event.target.value as Category } : current,
                      )
                    }
                    className="w-full rounded-2xl border border-mist-200 bg-mist-50 px-4 py-3 text-sm text-mist-900 outline-none transition focus:border-mist-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditDraft((current) =>
                    current ? { ...current, active: !current.active } : current,
                  )
                }
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                  editDraft.active
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-mist-200 bg-mist-100"
                }`}
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-mist-900">
                    {editDraft.active ? "Active" : "Inactive"}
                  </p>
                  <p className="text-xs text-mist-600">
                    {editDraft.active ? "Visible on site" : "Hidden from customers"}
                  </p>
                </div>
                <span
                  className={`relative inline-flex h-8 w-14 items-center rounded-full px-1 transition ${
                    editDraft.active ? "bg-emerald-500" : "bg-mist-300"
                  }`}
                >
                  <span
                    className={`h-6 w-6 rounded-full bg-white shadow transition ${
                      editDraft.active ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-full border border-mist-300 px-5 py-3 text-sm font-medium text-mist-700 transition hover:border-mist-500 hover:text-mist-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditor}
                className="rounded-full bg-mist-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-mist-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AdminPanelSection;
