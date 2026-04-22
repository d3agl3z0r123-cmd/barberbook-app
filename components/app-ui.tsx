"use client";

import Link from "next/link";
import { ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl border border-[#D8C3A5] bg-[#FFF7EC] px-4 py-3 text-base font-medium text-[#2B2118] outline-none transition-all placeholder:text-[#8B735B]/55 focus:border-[#A86840] focus:ring-2 focus:ring-[#A86840]/20";
export const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-[#A86840] px-4 py-2.5 text-sm font-bold text-[#FFF7EC] transition-all hover:bg-[#8A5433] disabled:opacity-50";
export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-[#D8C3A5] bg-[#FFF7EC] px-4 py-2.5 text-sm font-bold text-[#5B4F3A] transition-all hover:border-[#A86840] hover:bg-[#F1DDC2] disabled:opacity-50";
export const ghostButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-[#D8C3A5] bg-white/45 px-3.5 py-2 text-sm font-bold text-[#5B4F3A] transition-all hover:border-[#A86840] hover:bg-[#FFF7EC] disabled:opacity-50";
export const whiteCardClass = "rounded-2xl border border-[#D8C3A5]/70 bg-[#FFF7EC]/92 shadow-[0_18px_55px_rgba(43,33,24,0.10)] backdrop-blur";
export const luxuryPageClass = "min-h-screen bg-[#F4EADB] text-[#2B2118]";
export const luxuryPanelClass = "rounded-2xl border border-[#D8C3A5]/80 bg-[#FFF7EC] shadow-[0_22px_70px_rgba(43,33,24,0.13)]";
export const luxuryMutedPanelClass = "rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3]/85 shadow-[0_16px_45px_rgba(43,33,24,0.10)]";
export const luxuryPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-[#A86840] px-5 py-3 text-sm font-bold text-[#FFF7EC] transition-all hover:bg-[#8A5433] disabled:opacity-50";
export const luxurySecondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-[#A86840]/50 bg-[#FFF7EC]/65 px-5 py-3 text-sm font-bold text-[#5B4F3A] transition-all hover:border-[#A86840] hover:bg-[#F1DDC2] disabled:opacity-50";
export const luxuryGhostButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-[#D8C3A5] bg-white/45 px-4 py-2.5 text-sm font-bold text-[#5B4F3A] transition-all hover:border-[#A86840] hover:bg-[#FFF7EC] disabled:opacity-50";
export const luxuryInputClass =
  "w-full rounded-xl border border-[#D8C3A5] bg-[#FFF7EC] px-4 py-3 text-base font-medium text-[#2B2118] outline-none transition-all placeholder:text-[#8B735B]/55 focus:border-[#A86840]/80 focus:ring-2 focus:ring-[#A86840]/20";
export const luxuryHeadingClass = "font-extrabold tracking-tight text-[#2B2118]";

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
        <p className="text-sm font-medium text-[#5B4F3A]/75">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#2B2118]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5B4F3A]/78">{subtitle}</p> : null}
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
            {title ? <h2 className="text-2xl font-semibold text-[#2B2118]">{title}</h2> : null}
            {subtitle ? <p className="mt-2 text-sm leading-6 text-[#5B4F3A]/78">{subtitle}</p> : null}
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
    <div className="flex items-start gap-3 rounded-2xl border border-dashed border-[#D8C3A5]/70 bg-[#F8E8D3] px-4 py-5 text-sm text-[#5B4F3A]/78">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F8E8D3] text-[#5B4F3A]/78 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M7 4h10m-9 7v7m4-7v7m4-7v7M6 7l1 13h10l1-13" />
        </svg>
      </div>
      <div>
        <p className="font-medium text-[#2B2118]">{title}</p>
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
        ? "border-[#A86840]/40 bg-[#A86840]/15 text-[#7A2F22]"
        : "border-[#D8C3A5]/70 bg-[#F8E8D3] text-[#5B4F3A]/85";

  return (
    <div className={`rounded-2xl border px-4 py-4 text-sm ${tone}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-2 leading-6">{body}</p>
      {meta ? <p className="mt-2 text-xs opacity-80">{meta}</p> : null}
    </div>
  );
}

export function DataPreview({ title, children }: { title: string; children: ReactNode }) {
  const showDebug = process.env.NEXT_PUBLIC_SHOW_DEBUG === "true";
  const displayTitle = title.toLowerCase().includes("backend") ? "Estado da operação" : title;

  return (
    <SectionCard title={displayTitle}>
      {showDebug ? (
        <div className="overflow-x-auto rounded-2xl bg-[#F4EADB] p-4 text-xs leading-6 text-[#2B2118]">{children}</div>
      ) : (
        <div className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4 text-sm leading-6 text-[#5B4F3A]">
          Os dados foram processados. As respostas técnicas ficam ocultas na versão online.
        </div>
      )}
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
  ];

  return (
    <main className="min-h-screen bg-[#F4EADB] text-[#2B2118]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-[#D8C3A5]/70 bg-[#EAD8BF] px-5 py-6 text-[#2B2118] lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF7EC] text-[#A86840] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
                <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-[#2B2118]">BarberBook</p>
              <p className="text-sm text-[#5B4F3A]/70">Sistema interno</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2 border-t border-[#D8C3A5]/70 pt-6">
            {navItems.map((item) => {
              const isActive = item.href === currentPath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive ? "bg-[#A86840] text-[#FFF7EC] shadow-sm ring-1 ring-[#A86840]/30" : "text-[#5B4F3A]/85 hover:bg-[#FFF7EC] hover:text-[#2B2118]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-3 rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#2B2118]/35">Utilizador</p>
              <p className="mt-2 text-sm font-medium text-[#2B2118]">{userLabel ?? "Sem sessão ativa"}</p>
            </div>
            <div className="border-t border-[#D8C3A5]/70 pt-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[#2B2118]/35">Barbearia</p>
              <p className="mt-2 text-sm font-medium text-[#2B2118]">{shopLabel ?? "Ainda sem barbearia"}</p>
            </div>
          </div>
        </aside>

        <section className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 p-4 md:p-6 xl:p-8">
          <PageHeader eyebrow="BarberBook" title={title} subtitle={subtitle} />
          {children}
        </section>
      </div>
    </main>
  );
}
