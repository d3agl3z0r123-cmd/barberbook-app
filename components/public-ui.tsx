"use client";

import Link from "next/link";
import { ReactNode } from "react";

export const publicPageClass = "min-h-screen bg-[#F4EADB] text-[#2B2118]";
export const publicCardClass =
  "rounded-[32px] border border-[#D8C3A5]/80 bg-[#FFF7EC] shadow-[0_18px_50px_rgba(43,33,24,0.10)]";
export const publicInputClass =
  "w-full rounded-2xl border border-[#D8C3A5] bg-white px-4 py-4 text-base text-[#2B2118] outline-none transition-all placeholder:text-[#8B735B]/55 focus:border-[#A86840] focus:ring-2 focus:ring-[#A86840]/20";
export const publicPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-2xl bg-[#A86840] px-6 py-4 text-base font-bold text-[#FFF7EC] transition-all hover:bg-[#8A5433] disabled:cursor-not-allowed disabled:bg-[#D8C3A5]";
export const publicSecondaryButtonClass =
  "inline-flex items-center justify-center rounded-2xl border border-[#D8C3A5] bg-white px-5 py-4 text-base font-bold text-[#5B4F3A] transition-all hover:border-[#A86840] hover:bg-[#F8E8D3] disabled:cursor-not-allowed disabled:opacity-50";

export function PublicPageShell({
  children,
  topLink,
}: {
  children: ReactNode;
  topLink?: ReactNode;
}) {
  return (
    <main className={publicPageClass}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-[#2B2118]">
            BarberBook
          </Link>
          {topLink}
        </div>
        {children}
      </div>
    </main>
  );
}

export function MinimalAuthCard({
  title,
  subtitle,
  alternateText,
  alternateHref,
  alternateLabel,
  children,
}: {
  title: string;
  subtitle: string;
  alternateText: string;
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
}) {
  return (
    <PublicPageShell
      topLink={
        <Link href="/" className="text-sm font-bold text-[#5B4F3A] transition-all hover:text-[#2B2118]">
          Voltar ao site
        </Link>
      }
    >
      <div className="mx-auto flex w-full max-w-xl flex-1 items-center justify-center py-8">
        <section className={`${publicCardClass} w-full p-7 md:p-9`}>
          <div className="mb-8">
            <p className="text-sm font-bold tracking-tight text-[#8B735B]">BarberBook</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] text-[#2B2118] md:text-[2rem]">{title}</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#5B4F3A]">{subtitle}</p>
          </div>
          {children}
          <p className="mt-6 text-sm text-[#5B4F3A]">
            {alternateText}{" "}
            <Link href={alternateHref} className="font-extrabold text-[#A86840] transition-all hover:text-[#8A5433]">
              {alternateLabel}
            </Link>
          </p>
        </section>
      </div>
    </PublicPageShell>
  );
}

export function MinimalSocialButton({
  label,
  onClick,
}: {
  provider: "google";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-[#D8C3A5] bg-white px-4 py-3.5 text-sm font-bold text-[#2B2118] transition-all hover:bg-[#F8E8D3]"
    >
      <GoogleIcon />
      <span>{label}</span>
    </button>
  );
}

export function MinimalDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-[#D8C3A5]" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#FFF7EC] px-3 text-sm text-[#8B735B]">ou</span>
      </div>
    </div>
  );
}

export function BookingHeader({
  name,
  subtitle,
  badges,
  avatarLabel,
  imageUrl,
  logoUrl,
  instagramUrl,
  facebookUrl,
}: {
  name: string;
  subtitle: string;
  badges: string[];
  avatarLabel: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#D8C3A5]/80 bg-[#FFF7EC] shadow-[0_18px_50px_rgba(43,33,24,0.10)]">
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#EAD8BF_0%,#D8C3A5_38%,#A86840_100%)] px-6 text-center md:h-72">
        {imageUrl ? (
          <img src={imageUrl} alt={`Imagem da barbearia ${name}`} className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]" />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,33,24,0.16),rgba(43,33,24,0.58))]" />
        <div className="relative z-10 mx-auto max-w-3xl text-[#FFF7EC]">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#FFF7EC]/80">Nova marcação</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">{name}</h1>
        </div>
      </div>
      <div className="relative space-y-5 p-6 pt-0 text-center md:p-10 md:pt-0">
        <div className="mx-auto -mt-16 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-[#FFF7EC] bg-[#A86840] text-3xl font-extrabold text-[#FFF7EC] shadow-sm md:h-36 md:w-36">
          {logoUrl ? (
            <img src={logoUrl} alt={`Logo da barbearia ${name}`} className="h-full w-full object-cover" />
          ) : (
            <span>{avatarLabel}</span>
          )}
        </div>
        <div>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-8 text-[#5B4F3A] md:text-base">{subtitle}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-600"
            >
              {badge}
            </span>
          ))}
        </div>
        {(instagramUrl || facebookUrl) ? (
          <div className="flex justify-center gap-3">
            {instagramUrl ? (
              <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D8C3A5] bg-white text-[#A86840] transition-all hover:border-[#A86840] hover:bg-[#F8E8D3]" aria-label="Abrir Instagram">
                <InstagramIcon />
              </a>
            ) : null}
            {facebookUrl ? (
              <a href={facebookUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#D8C3A5] bg-white text-[#A86840] transition-all hover:border-[#A86840] hover:bg-[#F8E8D3]" aria-label="Abrir Facebook">
                <FacebookIcon />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <path d="M9.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z" />
      <path d="M16.5 7.8h.01" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M14.2 8.2h1.7V5.3a21.6 21.6 0 0 0-2.5-.1c-2.5 0-4.1 1.5-4.1 4.3V12H6.6v3.3h2.7V23h3.4v-7.7h2.7l.4-3.3h-3.1V9.8c0-1 .3-1.6 1.5-1.6Z" />
    </svg>
  );
}

export function BookingStepCard({
  title,
  description,
  children,
  onBack,
  onNext,
  isNextDisabled,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  isNextDisabled?: boolean;
  footer?: ReactNode;
}) {
  return (
    <section className={`${publicCardClass} overflow-hidden`}>
      <div className="border-b border-neutral-200 px-7 py-6 md:px-10">
        <div className="flex items-start gap-4">
          <div className="w-10">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-950"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            ) : (
              <span className="block h-10 w-10" />
            )}
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-neutral-950 md:text-3xl">{title}</h2>
            {description ? <p className="mt-2 text-base leading-7 text-neutral-500">{description}</p> : null}
          </div>
          <div className="w-10">
            {onNext ? (
              <button
                type="button"
                onClick={onNext}
                disabled={isNextDisabled}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            ) : (
              <span className="block h-10 w-10" />
            )}
          </div>
        </div>
      </div>
      <div className="px-7 py-7 md:px-10 md:py-8">{children}</div>
      {footer ? <div className="border-t border-neutral-200 px-7 py-6 md:px-10">{footer}</div> : null}
    </section>
  );
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
}: {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <span
            key={index}
            className={`h-2.5 w-10 rounded-full transition-all ${
              index + 1 <= currentStep ? "bg-neutral-950" : "bg-neutral-200"
            }`}
          />
        ))}
      </div>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-base font-semibold text-neutral-500 transition-all hover:text-neutral-900"
        >
          Voltar
        </button>
      ) : (
        <span className="text-base font-medium text-neutral-400">Passo {currentStep}</span>
      )}
    </div>
  );
}

export function SelectionList({ children }: { children: ReactNode }) {
  return <div className="grid gap-3">{children}</div>;
}

export function SelectionTile({
  active,
  onClick,
  title,
  subtitle,
  meta,
  disabled,
  leading,
}: {
  active?: boolean;
  onClick?: () => void;
  title: string;
  subtitle?: string;
  meta?: string;
  disabled?: boolean;
  leading?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-2xl border px-4 py-4 text-left transition-all ${
        disabled
          ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
          : active
            ? "border-neutral-950 bg-neutral-950 text-white"
            : "border-neutral-200 bg-white hover:border-neutral-400 hover:bg-neutral-50"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {leading ? <div>{leading}</div> : null}
          <div>
            <p className="text-lg font-semibold tracking-[-0.02em]">{title}</p>
            {subtitle ? (
              <p className={`mt-1 text-base leading-6 ${active ? "text-white/75" : "text-neutral-500"}`}>{subtitle}</p>
            ) : null}
          </div>
        </div>
        {meta ? (
          <span
            className={`rounded-full px-3 py-1.5 text-base font-semibold ${
              active ? "bg-white text-neutral-950" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {meta}
          </span>
        ) : null}
      </div>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5A9.5 9.5 0 0 0 2.5 12 9.5 9.5 0 0 0 12 21.5c5.5 0 9.1-3.9 9.1-9.4 0-.6-.1-1.1-.2-1.9H12Z"
      />
      <path
        fill="#34A853"
        d="M3.6 7.6 6.8 9.9A6 6 0 0 1 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 8.3 2.5 5.1 4.6 3.6 7.6Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.5c2.5 0 4.6-.8 6.2-2.3l-2.9-2.4c-.8.6-1.8 1.2-3.3 1.2a6 6 0 0 1-5.6-4.1l-3.1 2.4A9.5 9.5 0 0 0 12 21.5Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 12.1c0-.6-.1-1.1-.2-1.9H12v3.9h5.5c-.3 1.4-1.1 2.4-2.2 3.1l2.9 2.4c1.7-1.6 2.9-4 2.9-7.5Z"
      />
    </svg>
  );
}
