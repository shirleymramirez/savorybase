function FooterSection() {
  return (
    <footer className="mt-6 rounded-[28px] border border-white/70 bg-white/75 px-5 py-4 text-sm text-mist-600 shadow-soft backdrop-blur sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Built for food teams managing menu content, imagery, pricing, and availability.</p>
        <p className="text-mist-500">SavoryBase CMS • by Shirley Ramirez | shirley.mramirez@yahoo.com @{new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

export default FooterSection;
