import Link from "next/link";
import {
  luxuryGhostButtonClass,
  luxuryMutedPanelClass,
  luxuryPageClass,
  luxuryPanelClass,
  luxurySecondaryButtonClass,
} from "@/components/app-ui";

const primaryButton =
  "inline-flex items-center justify-center rounded-2xl bg-[#A86840] px-8 py-4 text-base font-extrabold text-[#FFF7EC] shadow-[0_18px_40px_rgba(168,104,64,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#8A5433]";

const benefits = [
  "Marcações online sem troca infinita de mensagens",
  "Agenda organizada por barbeiro, serviço e horário",
  "Link público pronto para Instagram, Google e QR Code",
];

const proofCards = [
  { value: "24/7", label: "o teu link aceita marcações" },
  { value: "30s", label: "para o cliente escolher horário" },
  { value: "1 painel", label: "para controlar a barbearia" },
];

export default function HomePage() {
  return (
    <main className={luxuryPageClass}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 md:px-6 xl:px-8">
        <header className={`${luxuryMutedPanelClass} flex items-center justify-between gap-4 px-5 py-4`}>
          <Link href="/" className="text-xl font-extrabold tracking-tight text-[#2B2118]">
            BarberBook
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/login" className={luxuryGhostButtonClass}>
              Entrar
            </Link>
            <Link href="/register" className={primaryButton}>
              Começar grátis
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
          <div className={`${luxuryPanelClass} p-7 md:p-10 xl:p-12`}>
            <span className="inline-flex rounded-full border border-[#A86840]/30 bg-[#A86840]/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-[#A86840]">
              SaaS para barbearias
            </span>

            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.94] tracking-[-0.06em] text-[#2B2118] md:text-7xl xl:text-8xl">
              A tua agenda cheia, sem viveres no WhatsApp.
            </h1>

            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-[#5B4F3A] md:text-xl">
              O BarberBook dá à tua barbearia um link de marcação profissional, agenda organizada e menos trabalho manual.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className={primaryButton}>
                Criar conta grátis
              </Link>
              <Link href="/book/barbearia-token-premium" className={luxurySecondaryButtonClass}>
                Ver exemplo de marcação
              </Link>
            </div>

            <div className="mt-8 grid gap-3">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#A86840] text-sm font-black text-[#FFF7EC]">
                    ✓
                  </span>
                  <p className="text-base font-bold text-[#2B2118]">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${luxuryPanelClass} p-5 md:p-6`}>
            <div className="rounded-[32px] border border-[#D8C3A5]/70 bg-[#FFF7EC] p-5 shadow-sm">
              <div className="rounded-[26px] bg-[#2B2118] p-5 text-[#FFF7EC]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#D8C3A5]">Hoje</p>
                    <h2 className="mt-1 text-3xl font-black">Agenda da barbearia</h2>
                  </div>
                  <span className="rounded-full bg-[#A86840] px-3 py-1 text-xs font-black">Ao vivo</span>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    ["09:30", "João Silva", "Corte + barba"],
                    ["10:00", "Miguel Costa", "Degradê"],
                    ["11:30", "Pedro Martins", "Corte clássico"],
                    ["14:00", "Rui Andrade", "Barba"],
                  ].map(([time, client, service]) => (
                    <div key={`${time}-${client}`} className="grid grid-cols-[72px_1fr] gap-3 rounded-2xl bg-[#FFF7EC] p-4 text-[#2B2118]">
                      <p className="text-lg font-black">{time}</p>
                      <div>
                        <p className="text-base font-extrabold">{client}</p>
                        <p className="mt-1 text-sm font-medium text-[#5B4F3A]">{service}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {proofCards.map((card) => (
                  <div key={card.value} className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">
                    <p className="text-3xl font-black text-[#2B2118]">{card.value}</p>
                    <p className="mt-2 text-sm font-semibold leading-5 text-[#5B4F3A]">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={`${luxuryMutedPanelClass} mb-6 p-6 md:p-8`}>
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#A86840]">Pronto para vender</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#2B2118] md:text-5xl">
                Começa hoje. Partilha o teu link ainda esta semana.
              </h2>
            </div>
            <Link href="/register" className={primaryButton}>
              Quero organizar a minha barbearia
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
