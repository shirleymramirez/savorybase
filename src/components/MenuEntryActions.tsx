type MenuEntryActionsProps = {
  isVisible: boolean;
  isDisabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function MenuEntryActions({
  isVisible,
  isDisabled = false,
  onEdit,
  onDelete,
}: MenuEntryActionsProps) {
  const visibilityClass = isVisible
    ? "opacity-100"
    : "pointer-events-none opacity-0";

  return (
    <div
      className={`mt-2 flex items-center justify-end gap-2 transition ${visibilityClass}`}
      aria-hidden={!isVisible ? undefined : false}
    >
      <button
        type="button"
        onClick={onEdit}
        disabled={isDisabled}
        aria-label="Edit menu item"
        title="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-mist-200 bg-white text-mist-600 transition hover:border-mist-500 hover:text-mist-900 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDisabled}
        aria-label="Delete menu item"
        title="Delete"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 transition hover:border-rose-400 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        >
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v5" />
          <path d="M14 11v5" />
        </svg>
      </button>
    </div>
  );
}

export default MenuEntryActions;
