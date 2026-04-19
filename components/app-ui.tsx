"use client";

import Link from "next/link";
import { ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-sm text-[#E8DCCB] outline-none transition-all placeholder:text-[#E8DCCB]/35 focus:border-[#A63A3A] focus:ring-2 focus:ring-[#A63A3A]/20";
export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-[#A63A3A] px-4 py-2.5 text-sm font-medium text-[#F5F1EA] transition-all hover:bg-[#8D2F2F] disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium text-[#E8DCCB] transition-all hover:border-[#A63A3A]/60 hover:bg-[#222222] disabled:opacity-50";
export const ghostButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A] px-3.5 py-2 text-sm font-medium text-[#E8DCCB]/80 transition-all hover:border-[#A63A3A]/60 hover:bg-[#202020] disabled:opacity-50";
export const whiteCardClass = "rounded-2xl border border-white/10 bg-[#1A1A1A] shadow-[0_12px_40px_rgba(0,0,0,0.18)]";
export const luxuryPageClass = "min-h-screen bg-[#0B0B0B] text-[#E8DCCB]";
export const luxuryPanelClass = "rounded-2xl border border-white/10 bg-[#111111] shadow-[0_20px_70px_rgba(0,0,0,0.35)]";
export const luxuryMutedPanelClass = "rounded-2xl border border-white/10 bg-[#1A1A1A] shadow-[0_16px_40px_rgba(0,0,0,0.25)]";
export const luxuryPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-[#A63A3A] px-5 py-3 text-sm font-medium text-[#F5F1EA] transition-all hover:bg-[#8D2F2F] disabled:opacity-50";
export const luxurySecondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-[#A63A3A]/50 bg-transparent px-5 py-3 text-sm font-medium text-[#E8DCCB] transition-all hover:border-[#A63A3A] hover:bg-[#A63A3A]/10 disabled:opacity-50";
export const luxuryGhostButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-[#E8DCCB]/85 transition-all hover:border-[#A63A3A]/40 hover:bg-white/10 disabled:opacity-50";
export const luxuryInputClass =
  "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-[#E8DCCB] outline-none transition-all placeholder:text-[#E8DCCB]/35 focus:border-[#A63A3A]/70 focus:ring-2 focus:ring-[#A63A3A]/15";
export const luxuryHeadingClass = "font-semibold tracking-tight text-[#E8DCCB] [font-family:'Arial_Black',Impact,'Segoe_UI',sans-serif]";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className={`${whiteCardClass} flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between`}>
      <div>
        <p className="text-sm font-medium text-[#E8DCCB]/55">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#E8DCCB]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[#E8DCCB]/60">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

export function SectionCard({
  title,
  subtitle,
  actions,
  children,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={`${whiteCardClass} p-6 md:p-8`}>
      {title || subtitle || actions ? (
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <h2 className="text-2xl font-semibold text-[#E8DCCB]">{title}</h2> : null}
            {subtitle ? <p className="mt-2 text-sm leading-6 text-[#E8DCCB]/60">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-white/10 bg-[#151515] px-4 py-5 text-sm text-[#E8DCCB]/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1F1F1F] text-[#E8DCCB]/60 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M7 4h10m-9 7v7m4-7v7m4-7v7M6 7l1 13h10l1-13" />
        </svg>
      </div>
      <div>
        <p className="font-medium text-[#E8DCCB]">{title}</p>
        <p className="mt-1">{body}</p>
      </div>
    </div>
  );
}

export function StatusNotice({
  kind,
  title,
  body,
  meta,
}: {
  kind: "idle" | "success" | "error";
  title: string;
  body: string;
  meta?: string;
}) {
  const tone =
    kind === "success"
      ? "border-emerald-900/40 bg-emerald-950/40 text-emerald-200"
      : kind === "error"
        ? "border-[#A63A3A]/40 bg-[#A63A3A]/15 text-[#F4D7D7]"
        : "border-white/10 bg-[#151515] text-[#E8DCCB]/70";

  return (
    <div className={`rounded-2xl border px-4 py-4 text-sm ${tone}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-2 leading-6">{body}</p>
      {meta ? <p className="mt-2 text-xs opacity-80">{meta}</p> : null}
    </div>
  );
}

export function DataPreview({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SectionCard title={title}>
      <div className="overflow-x-auto rounded-2xl bg-[#0B0B0B] p-4 text-xs leading-6 text-[#E8DCCB]">{children}</div>
    </SectionCard>
  );
}

type ShellNavItem = {
  href: string;
  label: string;
};

export function InternalShell({
  currentPath,
  title,
  subtitle,
  userLabel,
  shopLabel,
  children,
}: {
  currentPath: string;
  title: string;
  subtitle: string;
  userLabel?: string;
  shopLabel?: string;
  children: ReactNode;
}) {
  const navItems: ShellNavItem[] = [
    { href: "/backoffice", label: "Backoffice" },
    { href: "/dashboard-day", label: "Agenda diária" },
    { href: "/barbershop-test", label: "Barbearia" },
    { href: "/management-test", label: "Barbeiros e serviços" },
    { href: "/appointments-test", label: "Agendamentos" },
    { href: "/auth-test", label: "Autenticação" },
  ];

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-[#E8DCCB]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#090909] px-5 py-6 text-[#E8DCCB] lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A1A1A] text-[#A63A3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#E8DCCB]">BarberPro</p>
              <p className="text-sm text-[#E8DCCB]/45">Sistema interno</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2 border-t border-white/10 pt-6">
            {navItems.map((item) => {
              const isActive = item.href === currentPath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive ? "bg-[#A63A3A] text-[#F5F1EA] shadow-sm ring-1 ring-[#A63A3A]/30" : "text-[#E8DCCB]/72 hover:bg-[#1A1A1A] hover:text-[#F5F1EA]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-[#131313] p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#E8DCCB]/35">Utilizador</p>
              <p className="mt-2 text-sm font-medium text-[#E8DCCB]">{userLabel ?? "Sem sessão ativa"}</p>
            </div>
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#E8DCCB]/35">Barbearia</p>
              <p className="mt-2 text-sm font-medium text-[#E8DCCB]">{shopLabel ?? "Ainda sem barbearia"}</p>
            </div>
          </div>
        </aside>

        <section className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 p-4 md:p-6 xl:p-8">
          <PageHeader eyebrow="BarberPro" title={title} subtitle={subtitle} />
          {children}
        </section>
      </div>
    </main>
  );
}
