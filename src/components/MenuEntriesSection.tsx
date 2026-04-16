import { FoodItem } from "../types";

type MenuEntriesSectionProps = {
  items: FoodItem[];
  selectedIds: number[];
  onSelectAll: () => void;
  onToggleSelection: (id: number) => void;
};

function MenuEntriesSection({
  items,
  selectedIds,
  onSelectAll,
  onToggleSelection,
}: MenuEntriesSectionProps) {
  return (
    <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-mist-500">Menu Entries</p>
          <h2 className="mt-2 font-serif text-3xl text-mist-900">Current Items</h2>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-mist-600 transition hover:text-mist-900"
          onClick={onSelectAll}
        >
          Select All
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => {
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
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-16 rounded-[20px] object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-mist-900">{item.name}</p>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-medium ${
                      item.active ? "bg-emerald-100 text-emerald-700" : "bg-mist-200 text-mist-700"
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
    </section>
  );
}

export default MenuEntriesSection;
