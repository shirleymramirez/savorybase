type HeaderSectionProps = {
  itemCount: number;
  activeCount: number;
  averagePrice: number;
};

function HeaderSection({ itemCount, activeCount, averagePrice }: HeaderSectionProps) {
  return (
    <header className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-soft backdrop-blur">
      <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-mist-500">SavoryBase CMS</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-mist-900 sm:text-5xl">
            Clean menu management for modern food websites.
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
      </div>
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
