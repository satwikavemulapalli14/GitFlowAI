export default function Loader({ fullPage = false, text = 'Loading...' }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        {text && <p className="mt-4 text-sm text-gray-500">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      {text && <p className="mt-3 text-sm text-gray-500">{text}</p>}
    </div>
  );
}
