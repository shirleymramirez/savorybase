import { useEffect, useState } from "react";
import { Category, FoodItem } from "../types";

const FOODS_API_URL = "/api/foods";
const MAX_INLINE_IMAGE_BYTES = 60 * 1024;

type AdminPanelSectionProps = {
  bulkCategory: Category;
  categories: Category[];
  lowStockCount: number;
  selectedItems: FoodItem[];
  onBulkCategoryChange: (value: Category) => void;
  onApplyBulkCategory: () => void;
  onApplyBulkStatus: (active: boolean) => void;
  onUpdateItem: (
    id: string | number,
    updates: Pick<FoodItem, "name" | "description" | "price" | "categories" | "active" | "imageUrl">,
  ) => void;
};

type EditDraft = {
  id: string | number;
  name: string;
  description: string;
  price: string;
  category: Category;
  active: boolean;
  imageUrl: string;
};

async function readImageFile(file: File) {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () => reject(new Error("Unable to process the selected image."));
    nextImage.src = source;
  });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return source;
  }

  const maxBytes = MAX_INLINE_IMAGE_BYTES;
  let width = image.width;
  let height = image.height;
  let quality = 0.68;
  let output = source;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const scale = Math.min(1, 960 / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    output = canvas.toDataURL("image/jpeg", quality);

    if (output.length * 0.75 <= maxBytes) {
      return output;
    }

    width = Math.max(240, Math.round(width * 0.76));
    height = Math.max(240, Math.round(height * 0.76));
    quality = Math.max(0.28, quality - 0.08);
  }

  if (output.length * 0.75 > maxBytes) {
    throw new Error("Image is too large. Please choose a smaller image and try again.");
  }

  return output;
}

function AdminPanelSection({
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
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [saveEditError, setSaveEditError] = useState<string | null>(null);

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
      imageUrl: currentItem.imageUrl,
    });
  }, [categories, editDraft?.id, selectedItems]);

  const openEditor = (item: FoodItem) => {
    setSaveEditError(null);
    setEditDraft({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toFixed(2),
      category: item.categories[0] ?? categories[0],
      active: item.active,
      imageUrl: item.imageUrl,
    });
  };

  const closeEditor = () => {
    setSaveEditError(null);
    setEditDraft(null);
  };

  const saveEditor = async () => {
    if (!editDraft) {
      return;
    }

    if (
      editDraft.imageUrl.startsWith("data:") &&
      editDraft.imageUrl.length * 0.75 > MAX_INLINE_IMAGE_BYTES
    ) {
      setSaveEditError("Image is too large. Please choose a smaller image and try again.");
      return;
    }

    const updates = {
      name: editDraft.name.trim() || "Untitled Dish",
      description: editDraft.description.trim() || "No description added yet.",
      price: Number(editDraft.price) || 0,
      categories: [editDraft.category],
      active: editDraft.active,
      imageUrl: editDraft.imageUrl,
    } satisfies Pick<FoodItem, "name" | "description" | "price" | "categories" | "active" | "imageUrl">;

    const payload = {
      name: updates.name,
      description: updates.description,
      price: updates.price,
      category: editDraft.category,
      active: updates.active,
      stock: updates.active ? "In Stock" : "Sold Out",
      imageUrl: updates.imageUrl,
    } as const;

    setIsSavingEdit(true);
    setSaveEditError(null);

    try {
      const response = await fetch(`${FOODS_API_URL}/${editDraft.id}`, {
        method: "PUT",
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

        if (response.status === 413) {
          throw new Error("Image is too large. Please choose a smaller image and try again.");
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

      onUpdateItem(editDraft.id, updates);
      closeEditor();
    } catch (error) {
      setSaveEditError(
        error instanceof Error ? error.message : "Unable to update this menu item right now.",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <>
      <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Admin Panel</p>
          <h2 className="mt-2 font-serif text-3xl text-mist-900">Update Items</h2>
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
                className="grid w-full gap-4 rounded-[24px] border border-mist-200 bg-mist-50 p-3 text-left transition hover:border-mist-400 hover:bg-white sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-16 w-16 rounded-[20px] object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-mist-900">{item.name}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                        item.active ? "bg-emerald-100 text-emerald-700" : "bg-mist-200 text-mist-700"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-mist-600">{item.description}</p>
                  <p className="mt-2 truncate text-xs text-mist-500">{item.categories.join(" • ")}</p>
                </div>
                <div className="flex items-center justify-between sm:block sm:text-right">
                  <p className="text-base font-semibold text-mist-900">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-mist-500">{item.stock}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {editDraft ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-mist-900/55 px-4 py-6">
          <div className="mx-auto w-full max-w-4xl rounded-[32px] border border-white/70 bg-white p-6 shadow-soft sm:p-7 max-sm:max-h-[calc(100vh-3rem)] max-sm:overflow-y-auto md:max-h-[calc(100vh-3rem)] md:overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Edit Item</p>
                <h3 className="mt-2 font-serif text-3xl text-mist-900">Update Menu Entry</h3>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                disabled={isSavingEdit}
                className="rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-mist-700 transition hover:border-mist-500 hover:text-mist-900"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-mist-700">Food Image</span>
                  <div className="group relative overflow-hidden rounded-[26px] border border-dashed border-mist-300 bg-mist-100/75 transition hover:border-mist-500 hover:bg-mist-100">
                    <div className="flex aspect-[4/5] items-center justify-center">
                      <img
                        src={editDraft.imageUrl}
                        alt={`${editDraft.name} preview`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="absolute inset-0 border-[12px] border-white/40" />
                    <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/88 p-4 backdrop-blur">
                      <p className="text-sm font-medium text-mist-900">Replace menu image</p>
                      <p className="mt-1 text-xs leading-5 text-mist-600">
                        Upload a new photo to update how this dish appears in the menu list.
                      </p>
                      <label className="mt-3 inline-flex cursor-pointer rounded-full bg-mist-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-mist-700">
                        Choose Image
                        <input
                          className="hidden"
                          type="file"
                          accept="image/*"
                          disabled={isSavingEdit}
                          onChange={async (event) => {
                            const file = event.target.files?.[0];

                            if (!file) {
                              return;
                            }

                            try {
                              const result = await readImageFile(file);
                              setEditDraft((current) =>
                                current ? { ...current, imageUrl: result } : current,
                              );
                              setSaveEditError(null);
                            } catch (error) {
                              setSaveEditError(
                                error instanceof Error
                                  ? error.message
                                  : "Unable to process the selected image.",
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </label>
              </div>

              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-mist-700">Name</span>
                  <input
                    value={editDraft.name}
                    disabled={isSavingEdit}
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
                    disabled={isSavingEdit}
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
                        disabled={isSavingEdit}
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
                      disabled={isSavingEdit}
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
                  disabled={isSavingEdit}
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

                {saveEditError ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {saveEditError}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeEditor}
                disabled={isSavingEdit}
                className="rounded-full border border-mist-300 px-5 py-3 text-sm font-medium text-mist-700 transition hover:border-mist-500 hover:text-mist-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditor}
                disabled={isSavingEdit}
                className="rounded-full bg-mist-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-mist-700 disabled:cursor-not-allowed disabled:bg-mist-400"
              >
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AdminPanelSection;
