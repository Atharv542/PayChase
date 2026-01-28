export default function Popup({
  open,
  title = "Notice",
  message = "",
  primaryText = "OK",
  secondaryText = "",
  onPrimary,
  onSecondary,
  onClose,
}) {
  if (!open) return null;

  const close = () => (onClose ? onClose() : onPrimary?.());

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={close}
      />

      {/* modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{message}</p>

          <div className="mt-5 flex items-center justify-end gap-3">
            {secondaryText ? (
              <button
                type="button"
                onClick={onSecondary}
                className="px-4 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {secondaryText}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onPrimary}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-sm hover:shadow-md transition"
            >
              {primaryText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
