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
}: AdminPanelSectionProps) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Admin Panel</p>
          <h2 className="mt-2 font-serif text-3xl text-mist-900">Bulk Updates</h2>
        </div>
        <span className="rounded-full bg-mist-100 px-3 py-1 text-xs font-medium text-mist-700">
          {selectedCount} selected
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onApplyBulkStatus(true)}
          className="rounded-2xl bg-mist-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-mist-700"
        >
          Mark Selected Active
        </button>
        <button
          type="button"
          onClick={() => onApplyBulkStatus(false)}
          className="rounded-2xl border border-mist-300 px-4 py-3 text-sm font-medium text-mist-700 transition hover:border-mist-500 hover:text-mist-900"
        >
          Mark Selected Inactive
        </button>
      </div>

      <div className="mt-4 rounded-[24px] bg-mist-100/75 p-4">
        <label className="text-sm font-medium text-mist-700" htmlFor="bulk-category">
          Add category to selected items
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <select
            id="bulk-category"
            value={bulkCategory}
            onChange={(event) => onBulkCategoryChange(event.target.value as Category)}
            className="flex-1 rounded-2xl border border-mist-200 bg-white px-4 py-3 text-sm text-mist-900 outline-none transition focus:border-mist-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onApplyBulkCategory}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-mist-700 transition hover:bg-mist-200 hover:text-mist-900"
          >
            Apply Category
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-[24px] bg-mist-900 px-4 py-4 text-white">
        <div>
          <p className="text-sm font-medium">Attention Needed</p>
          <p className="text-xs text-white/75">{lowStockCount} items need inventory review.</p>
        </div>
        <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium">Inventory</span>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-mist-500">
          Selected Preview
        </h3>
        <div className="mt-3 space-y-3">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-mist-200 bg-mist-50 p-3"
            >
              <img src={item.image} alt={item.name} className="h-14 w-14 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-mist-900">{item.name}</p>
                <p className="truncate text-xs text-mist-600">{item.categories.join(" • ")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminPanelSection;
