export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${padding ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}
