// Componentes de UI reusáveis pro admin.
import Link from "next/link";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">{title}</h1>
        {subtitle && <p className="text-sm text-white/55 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="vp-card rounded-2xl p-4">
      <p className="text-xs text-white/55">{label}</p>
      <p className="text-2xl font-extrabold mt-1">{value}</p>
      {hint && <p className="text-[11px] text-white/45 mt-1">{hint}</p>}
    </div>
  );
}

export function PrimaryButton({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const cls = cn(
    "px-4 py-2 rounded-xl vp-gradient font-bold text-sm vp-glow disabled:opacity-50 disabled:cursor-not-allowed",
    className
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  href,
  onClick,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  const cls = cn(
    "px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 font-medium text-sm",
    className
  );
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("vp-card rounded-2xl p-4", className)}>{children}</div>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="vp-card rounded-2xl p-10 text-center">
      <p className="font-semibold">{title}</p>
      {hint && <p className="text-sm text-white/55 mt-1">{hint}</p>}
    </div>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-white/65 font-medium">
        {label}
        {required && <span className="text-[var(--color-vp-pink)] ml-1">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-[11px] text-white/45 mt-1">{hint}</p>}
    </label>
  );
}

export const inputCls =
  "w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]";

export const textareaCls = inputCls + " resize-none";

export const selectCls = inputCls + " appearance-none";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="vp-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("text-left px-4 py-3 text-[11px] uppercase tracking-wider text-white/55 font-medium border-b border-white/8", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-3 border-b border-white/5", className)}>{children}</td>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warn" | "danger" | "info";
}) {
  const toneCls = {
    default: "bg-white/10 text-white/75",
    success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    warn: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    info: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
  }[tone];
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold", toneCls)}>
      {children}
    </span>
  );
}
