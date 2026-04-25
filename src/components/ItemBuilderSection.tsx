import { ChangeEvent, DragEvent, ReactNode } from "react";
import { Category, DraftFoodItem } from "../types";

type ItemBuilderSectionProps = {
  draft: DraftFoodItem;
  categories: Category[];
  isDraggingImage: boolean;
  isSaving: boolean;
  saveError: string | null;
  onReset: () => void;
  onSave: () => Promise<void>;
  onImageSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onImageDrop: (event: DragEvent<HTMLDivElement>) => void;
  onImageDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onImageDragLeave: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onToggleCategory: (category: Category) => void;
  onToggleActive: () => void;
  onCropZoomChange: (value: number) => void;
  onCropXChange: (value: number) => void;
  onCropYChange: (value: number) => void;
};

function ItemBuilderSection({
  draft,
  categories,
  isDraggingImage,
  isSaving,
  saveError,
  onReset,
  onSave,
  onImageSelect,
  onImageDrop,
  onImageDragOver,
  onImageDragLeave,
  onNameChange,
  onDescriptionChange,
  onPriceChange,
  onToggleCategory,
  onToggleActive,
  onCropZoomChange,
  onCropXChange,
  onCropYChange,
}: ItemBuilderSectionProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Item Builder</p>
            <h2 className="mt-2 font-serif text-3xl text-mist-900">Food Data Entry</h2>
          </div>
          <button
            className="rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-mist-700 transition hover:border-mist-500 hover:text-mist-900"
            type="button"
            onClick={onReset}
            disabled={isSaving}
          >
            Reset Form
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-mist-700">Food Image</span>
              <div
                className={`group relative overflow-hidden rounded-[26px] border border-dashed bg-mist-100/75 transition hover:bg-mist-100 ${
                  isDraggingImage
                    ? "border-mist-900 ring-2 ring-mist-300"
                    : "border-mist-300 hover:border-mist-500"
                }`}
                onDragOver={onImageDragOver}
                onDragLeave={onImageDragLeave}
                onDrop={onImageDrop}
              >
                <div className="flex aspect-[4/5] items-center justify-center">
                  <img
                    src={draft.imageUrl}
                    alt="Food preview"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    style={{
                      objectPosition: `${draft.cropX}% ${draft.cropY}%`,
                      transform: `scale(${draft.cropZoom / 100})`,
                    }}
                  />
                </div>
                <div className="absolute inset-0 border-[12px] border-white/40" />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/88 p-4 backdrop-blur">
                  <p className="text-sm font-medium text-white">Drag and drop or click to upload</p>
                  <p className="mt-1 text-xs leading-5 text-white">
                    Designed for a 4:5 food card ratio with live crop framing.
                  </p>
                  <label className="mt-3 inline-flex cursor-pointer rounded-full bg-mist-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-mist-700">
                    Click to Upload
                    <input
                      className="hidden"
                      type="file"
                      accept="image/*"
                      onChange={onImageSelect}
                    />
                  </label>
                </div>
              </div>
            </label>

            <div className="rounded-[24px] bg-mist-100/70 p-4">
              <div className="flex items-center justify-between text-sm font-medium text-mist-700">
                <span>Basic Crop Tools</span>
                <span>{draft.cropZoom}% zoom</span>
              </div>
              <div className="mt-4 space-y-4">
                <Slider label="Zoom" value={draft.cropZoom} onChange={onCropZoomChange} />
                <Slider label="Horizontal" value={draft.cropX} onChange={onCropXChange} />
                <Slider label="Vertical" value={draft.cropY} onChange={onCropYChange} />
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <Field
              label="Food Name"
              hint="Use title case for menu-ready presentation."
              input={
                <input
                  className="w-full rounded-2xl border border-mist-200 bg-mist-50 px-4 py-3 text-base text-mist-900 outline-none transition focus:border-mist-500"
                  placeholder="Smoked Tomato Pasta"
                  value={draft.name}
                  onChange={(event) => onNameChange(event.target.value)}
                />
              }
            />

            <Field
              label="Short Description"
              hint="Ingredients, dietary notes, or service details."
              input={
                <textarea
                  className="min-h-28 w-full resize-none rounded-2xl border border-mist-200 bg-mist-50 px-4 py-3 text-base text-mist-900 outline-none transition focus:border-mist-500"
                  placeholder="House-made casarecce, roasted tomatoes, basil, whipped ricotta."
                  value={draft.description}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                />
              }
            />

            <Field
              label="Price"
              hint="Numeric input with a currency prefix."
              input={
                <div className="flex rounded-2xl border border-mist-200 bg-mist-50 focus-within:border-mist-500">
                  <span className="flex items-center px-4 text-mist-500">$</span>
                  <input
                    className="w-full rounded-r-2xl bg-transparent py-3 pr-4 text-base text-mist-900 outline-none"
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.price}
                    onChange={(event) => onPriceChange(event.target.value)}
                  />
                </div>
              }
            />

            <Field
              label="Category Tags"
              hint="Multi-select tags for front-end filtering."
              input={
                <div className="rounded-2xl border border-mist-200 bg-mist-50 p-3">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const selected = draft.categories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => onToggleCategory(category)}
                          className={`rounded-full px-3 py-2 text-sm transition ${
                            selected
                              ? "bg-mist-900 text-white"
                              : "bg-white text-mist-700 hover:bg-mist-200"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              }
            />

            <Field
              label="Inventory Visibility"
              hint="Hide sold-out items without deleting their data."
              input={
                <button
                  type="button"
                  onClick={onToggleActive}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition ${
                    draft.active ? "border-emerald-200 bg-emerald-50" : "border-mist-200 bg-mist-100"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-mist-900">
                      {draft.active ? "Active" : "Inactive"}
                    </p>
                    <p className="text-xs text-mist-600">
                      {draft.active ? "Visible on site" : "Hidden from customers"}
                    </p>
                  </div>
                  <span
                    className={`relative inline-flex h-8 w-14 items-center rounded-full px-1 transition ${
                      draft.active ? "bg-emerald-500" : "bg-mist-300"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full bg-white shadow transition ${
                        draft.active ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              }
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 rounded-full bg-mist-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-mist-700 disabled:cursor-not-allowed disabled:bg-mist-400"
              >
                {isSaving ? "Saving..." : "Save Food Item"}
              </button>
              <button
                type="button"
                disabled={isSaving}
                className="rounded-full border border-mist-300 px-5 py-3 text-sm font-medium text-mist-700 transition hover:border-mist-500 hover:text-mist-900"
              >
                Save as Draft
              </button>
            </div>

            {saveError ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {saveError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  input,
}: {
  label: string;
  hint: string;
  input: ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-mist-700">{label}</span>
        <span className="text-xs text-mist-500">{hint}</span>
      </div>
      {input}
    </label>
  );
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.14em] text-mist-500">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="200"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </label>
  );
}

export default ItemBuilderSection;
