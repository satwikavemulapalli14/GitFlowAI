export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} GitFlowAI. All rights reserved.
        </p>
        <div className="flex gap-4 text-sm text-gray-500">
          <a href="/docs" className="hover:text-gray-700">
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
