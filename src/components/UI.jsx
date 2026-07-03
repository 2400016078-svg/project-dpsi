import { Component } from "react";
import { AlertCircle, HelpCircle } from "lucide-react";

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-soft p-4 md:p-6 transition hover:shadow-medium ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = "primary", disabled, onClick, type = "button", className = "", icon: Icon }) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed";
  const styles = {
    primary:
      "bg-primary-dark text-white hover:bg-primary-medium disabled:bg-gray-200 disabled:text-gray-400 shadow-sm",
    secondary:
      "bg-transparent border-2 border-primary-dark text-primary-dark hover:bg-blue-50 disabled:border-gray-200 disabled:text-gray-400",
    danger:
      "bg-error text-white hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400",
    outline:
      "bg-white border border-gray-200 text-gray-700 hover:border-primary-light hover:text-primary-dark disabled:border-gray-100 disabled:text-gray-300",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-300",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function Input({ label, type = "text", value, onChange, placeholder, disabled, error, readOnly, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-caption text-gray-700 font-medium">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full rounded-xl border text-body-small bg-white focus:outline-none focus:ring-2 transition ${
            Icon ? "pl-9 pr-3" : "px-3"
          } py-2.5 ${
            error
              ? "border-error focus:ring-error/30 focus:border-error"
              : "border-gray-200 focus:ring-primary-light/40 focus:border-primary-light"
          } disabled:bg-gray-50 disabled:text-gray-500`}
        />
      </div>
      {error && <p className="text-caption text-error flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options, className = "" }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-caption text-gray-700 font-medium">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2.5 rounded-xl border border-gray-200 text-body-small bg-white focus:outline-none focus:ring-2 focus:ring-primary-light/40 focus:border-primary-light transition ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Chart({ skorMultimedia, skorTbsm }) {
  const maxVal = Math.max(skorMultimedia, skorTbsm, 1);
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-body-small">
          <span className="font-medium text-primary-dark">Multimedia / DKV</span>
          <span className="font-semibold text-primary-dark">{skorMultimedia}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(skorMultimedia / maxVal) * 100}%`,
              background: "linear-gradient(90deg, #3B82F6, #60A5FA)",
            }}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-body-small">
          <span className="font-medium text-accent-teal">TBSM</span>
          <span className="font-semibold text-accent-teal">{skorTbsm}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(skorTbsm / maxVal) * 100}%`,
              background: "linear-gradient(90deg, #0D9488, #14B8A6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function Badge({ children, color = "gray", size = "sm" }) {
  const sizeClasses = { sm: "px-2 py-0.5 text-caption", md: "px-3 py-1 text-body-small" };
  const colors = {
    green: "bg-success-light text-success",
    yellow: "bg-warning-light text-warning",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-error-light text-error",
    gray: "bg-gray-100 text-gray-600",
    teal: "bg-accent-teal-light text-accent-teal",
    orange: "bg-accent-orange-light text-accent-orange",
  };
  return (
    <span className={`inline-block rounded-full font-medium ${sizeClasses[size]} ${colors[color]}`}>
      {children}
    </span>
  );
}

export function Table({ headers, rows, renderRow, renderMobileCard }) {
  const hasMobileView = !!renderMobileCard;
  const table = (
    <table className="w-full text-body-small min-w-[500px]">
      <thead>
        <tr className="bg-gray-50 text-left">
          {headers.map((h, i) => (
            <th key={i} className="py-3 px-3 font-semibold text-gray-500 text-caption uppercase tracking-wider whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">{rows.map(renderRow)}</tbody>
    </table>
  );

  return (
    <>
      {hasMobileView ? (
        <>
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-100">{table}</div>
          <div className="sm:hidden space-y-3">{rows.map(renderMobileCard)}</div>
        </>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">{table}</div>
      )}
    </>
  );
}

export function Spinner({ text = "Memuat..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="flex gap-1.5">
        <span className="w-3 h-3 rounded-full bg-primary-light animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-3 h-3 rounded-full bg-primary-medium animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-3 h-3 rounded-full bg-primary-dark animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      {text && <p className="text-body-small text-gray-400">{text}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, message = "Belum ada data.", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {Icon ? (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon size={32} className="text-gray-400" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <HelpCircle size={32} className="text-gray-400" />
        </div>
      )}
      <p className="text-body-small text-gray-400 max-w-xs">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6 max-w-md w-full text-center">
            <div className="w-14 h-14 rounded-full bg-error-light flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h1 className="text-h2 font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h1>
            <p className="text-sm text-gray-500 mb-4">
              Aplikasi mengalami masalah. Silakan muat ulang halaman atau coba lagi.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-primary-dark text-white hover:bg-primary-medium transition"
            >
              Muat Ulang Halaman
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-gray-400 cursor-pointer">Detail teknis</summary>
                <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-lg overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
