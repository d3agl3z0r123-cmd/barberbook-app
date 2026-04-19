"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  luxuryGhostButtonClass,
  luxuryHeadingClass,
  luxuryInputClass,
  luxuryMutedPanelClass,
  luxuryPageClass,
  luxuryPanelClass,
  luxuryPrimaryButtonClass,
  luxurySecondaryButtonClass,
} from "@/components/app-ui";

export {
  luxuryGhostButtonClass,
  luxuryInputClass,
  luxuryPrimaryButtonClass,
  luxurySecondaryButtonClass,
  luxuryPanelClass,
};

export function AuthShell({
  title,
  subtitle,
  alternateHref,
  alternateLabel,
  children,
}: {
  title: string;
  subtitle: string;
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
}) {
  return (
    <main className={luxuryPageClass}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 xl:px-8">
        <header className={`${luxuryMutedPanelClass} flex flex-col gap-5 p-6 md:flex-row md:items-end md:justify-between`}>
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#A63A3A]">BarberPro</p>
            <h1 className={`mt-3 text-3xl md:text-4xl ${luxuryHeadingClass}`}>{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#E8DCCB]/60">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className={luxuryGhostButtonClass}>
              Voltar ao site
            </Link>
            <Link href={alternateHref} className={luxurySecondaryButtonClass}>
              {alternateLabel}
            </Link>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className={`${luxuryPanelClass} relative flex flex-col justify-between overflow-hidden p-8 text-white`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(166,58,58,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_48%)]" />
            <div className="relative">
              <span className="inline-flex rounded-full border border-[#A63A3A]/25 bg-[#A63A3A]/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#E8DCCB]">
                Urban Barber Access
              </span>
              <h2 className={`mt-6 text-4xl md:text-5xl ${luxuryHeadingClass}`}>
                Entra numa plataforma feita para barbearias com identidade forte e operação moderna.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#E8DCCB]/70">
                Entra no BarberPro para gerir agenda, clientes, equipa e o link público de marcações com uma presença mais urbana, jovem e profissional.
              </p>
            </div>

            <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Agenda", value: "Sempre sob controlo" },
                { label: "Clientes", value: "Experiencia premium" },
                { label: "Marcações", value: "Disponível 24/7" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#E8DCCB]/45">{item.label}</p>
                  <p className={`mt-3 text-lg ${luxuryHeadingClass}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`${luxuryMutedPanelClass} p-6 md:p-8`}>
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

export function SocialAuthButton({
  provider,
  label,
  onClick,
}: {
  provider: "google" | "apple";
  label: string;
  onClick: () => void;
}) {
  const isGoogle = provider === "google";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
        isGoogle
          ? "border-white/10 bg-[#E8DCCB] text-[#0B0B0B] hover:border-[#A63A3A]/40 hover:bg-[#f0e5d7]"
          : "border-[#A63A3A]/30 bg-[#0B0B0B] text-[#E8DCCB] hover:border-[#A63A3A] hover:bg-[#151515]"
      }`}
    >
      {isGoogle ? <GoogleIcon /> : <AppleIcon />}
      <span>{label}</span>
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-[#1A1A1A] px-3 text-sm text-[#E8DCCB]/45">ou</span>
      </div>
    </div>
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

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M16.7 12.6c0-2 1.6-3 1.7-3.1-1-.9-2.4-1-2.9-1-.9-.1-1.9.5-2.4.5-.6 0-1.4-.5-2.3-.5-1.2 0-2.3.7-2.9 1.8-1.3 2.2-.3 5.5.9 7.2.6.8 1.2 1.7 2.1 1.7.8 0 1.1-.5 2.1-.5.9 0 1.2.5 2.1.5s1.5-.8 2.1-1.6c.7-.9 1-1.9 1-2-.1 0-1.8-.7-1.8-3ZM14.9 6.3c.5-.6.9-1.4.8-2.3-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.2.9.1 1.7-.4 2.2-1Z" />
    </svg>
  );
}
