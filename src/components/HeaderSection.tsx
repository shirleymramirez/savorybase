type HeaderSectionProps = {
  itemCount: number;
  activeCount: number;
  averagePrice: number;
  username: string;
  onLogout: () => void;
};

function HeaderSection({
  itemCount,
  activeCount,
  averagePrice,
  username,
  onLogout,
}: HeaderSectionProps) {
  return (
    <header className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-soft backdrop-blur">
      <div className="flex gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4 px-6 py-6 sm:gap-6 sm:px-8">
            <p className="text-sm uppercase tracking-[0.28em] text-mist-500">SavoryBase</p>
        </div>
        <div className="flex flex-row items-center gap-4 px-6 py-6 sm:gap-6 sm:px-8">
          <p className="text-sm font-medium text-mist-600">Hello {username}</p>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full border border-mist-300 px-4 py-2 text-sm font-medium text-mist-700 transition hover:border-mist-500 hover:text-mist-900"
          >
            Logout
          </button>
        </div>
      </div>

      {/* <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-mist-900 sm:text-5xl">
            Food Service Management
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-mist-600 sm:text-base">
            Create polished food listings with image framing, dietary tags, pricing, inventory
            visibility and fast bulk updates from a single responsive admin panel.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <MetricCard label="Items" value={String(itemCount).padStart(2, "0")} />
          <MetricCard label="Active" value={String(activeCount).padStart(2, "0")} />
          <MetricCard label="Avg Price" value={`$${averagePrice.toFixed(2)}`} />
        </div>
      </div> */}
    </header>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-mist-100/80 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-mist-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-mist-900 sm:text-3xl">{value}</p>
    </div>
  );
}

export default HeaderSection;
