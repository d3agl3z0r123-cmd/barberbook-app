import Link from "next/link";
import {
  luxuryGhostButtonClass,
  luxuryMutedPanelClass,
  luxuryPageClass,
  luxuryPanelClass,
  luxurySecondaryButtonClass,
} from "@/components/app-ui";

const painPoints = [
  "Clientes esquecem-se das marcações quando tudo fica perdido em mensagens.",
  "Horários confusos criam atrasos, falhas e stress na operação diária.",
  "A equipa perde tempo a responder manualmente no WhatsApp e Instagram.",
  "Sem um sistema central, a barbearia perde controlo do negócio.",
];

const features = [
  {
    title: "Agenda inteligente",
    description: "Vês o dia todo de forma clara, evitas choques de horário e trabalhas com mais ritmo.",
  },
  {
    title: "Link exclusivo de marcação",
    description: "Recebe marcações online num link próprio, simples de partilhar e forte na imagem.",
  },
  {
    title: "Gestão completa de clientes",
    description: "Guarda contactos, histórico e contexto para atender melhor e vender mais recorrência.",
  },
  {
    title: "Organização de barbeiros",
    description: "Controla equipa, serviços e disponibilidade num único sítio.",
  },
  {
    title: "Controlo total num só painel",
    description: "Agenda, equipa e operação num backoffice feito para andar rápido.",
  },
];

const steps = [
  {
    step: "01",
    title: "Cria a tua barbearia",
    body: "Configura a conta, ajusta a unidade e deixa barbeiros e serviços prontos.",
  },
  {
    step: "02",
    title: "Partilha o teu link",
    body: "Abre o teu booking público e envia o link para clientes, stories e bio.",
  },
  {
    step: "03",
    title: "Recebe marcações automaticamente",
    body: "Menos conversa manual, mais agenda preenchida e mais controlo do dia.",
  },
];

const demoBlocks = [
  {
    title: "Backoffice",
    description: "Espaço pronto para screenshot real do painel interno, com leitura forte e visual de app.",
  },
  {
    title: "Agenda",
    description: "Bloco preparado para mostrar slots, ocupação e ritmo diário da unidade.",
  },
  {
    title: "Booking público",
    description: "Área pronta para mostrar a página de marcação usada pelo cliente final.",
  },
];

const statCards = [
  { label: "Marcações", value: "24/7", note: "Link sempre ativo" },
  { label: "Operação", value: "Mais controlo", note: "Menos caos no dia a dia" },
  { label: "Imagem", value: "Mais forte", note: "Marca mais moderna online" },
];

const titleClass = "font-bold tracking-tight text-[#2B2118]";
const primaryButton =
  "inline-flex items-center justify-center rounded-xl bg-[#A86840] px-7 py-4 text-sm font-bold text-[#FFF7EC] transition-all hover:bg-[#8A5433]";

export default function HomePage() {
  return (
    <main className={luxuryPageClass}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 xl:px-8">
        <header className={`${luxuryMutedPanelClass} flex items-center justify-between gap-4 px-5 py-4`}>
          <div>
            <p className={`text-xl ${titleClass}`}>BarberBook</p>
            <p className="text-sm text-[#5B4F3A]/70">Plataforma de gestão para barbearias modernas</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/book/barbearia-token-premium" className={luxuryGhostButtonClass}>
              Ver demonstração
            </Link>
            <Link href="/login" className={luxuryGhostButtonClass}>
              Entrar
            </Link>
            <Link href="/register" className={primaryButton}>
              Começar agora
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <div className={`${luxuryPanelClass} overflow-hidden p-8 md:p-10`}>
            <div className="rounded-2xl border border-[#D8C3A5]/70 bg-[#FFF7EC] p-6 md:p-8">
              <span className="inline-flex rounded-full border border-[#A86840]/30 bg-[#A86840]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#2B2118]">
                BarberBook
              </span>
              <h1 className={`mt-6 max-w-4xl text-5xl leading-[0.95] md:text-7xl ${titleClass}`}>
                Mete ordem na agenda. Mete mais clientes na cadeira.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#5B4F3A]/85 md:text-lg">
                O sistema de marcações para barbearias modernas que querem menos confusão, mais controlo e uma imagem mais forte.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className={primaryButton}>
                  Começar agora
                </Link>
                <Link href="/book/barbearia-token-premium" className={luxurySecondaryButtonClass}>
                  Ver demonstração
                </Link>
              </div>
              <p className="mt-4 text-sm text-[#5B4F3A]/70">
                Feito para barbearias com presença forte, operação rápida e foco total no cliente.
              </p>
            </div>
          </div>

          <div className={`${luxuryPanelClass} min-h-[560px] overflow-hidden p-4 md:p-5`}>
            <div className="flex h-full flex-col gap-4 rounded-[28px] border border-[#D8C3A5]/70 bg-[#FFF7EC] p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#A86840]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#D8C3A5]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#5B4F3A]/30" />
              </div>

              <div className="flex-1 rounded-[24px] border border-[#D8C3A5]/70 bg-[#FFF7EC] p-6">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#A86840]">Espaço para imagem</p>
                    <h2 className={`mt-4 max-w-md text-3xl md:text-4xl ${titleClass}`}>
                      Aqui entra uma fotografia forte e real da tua barbearia.
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-[#5B4F3A]/75">
                      Interior da loja, cadeira, corte em detalhe ou uma fotografia de equipa com presença.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {statCards.map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5B4F3A]/70">{metric.label}</p>
                        <p className={`mt-3 text-xl ${titleClass}`}>{metric.value}</p>
                        <p className="mt-2 text-xs leading-5 text-[#2B2118]/50">{metric.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${luxuryMutedPanelClass} p-6 md:p-8`}>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A86840]">Problema</p>
            <h2 className={`mt-3 text-3xl md:text-5xl ${titleClass}`}>
              Se a agenda está espalhada por mensagens, o negócio anda sempre atrasado.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {painPoints.map((pain) => (
              <article key={pain} className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-5">
                <p className="text-sm leading-7 text-[#2B2118]/70">{pain}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className={`${luxuryMutedPanelClass} p-6 md:p-8`}>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A86840]">Solução</p>
            <h2 className={`mt-3 text-3xl md:text-5xl ${titleClass}`}>
              Tudo o que precisas para gerir a barbearia sem perder tempo.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5B4F3A]/80">
              O BarberBook junta agenda, clientes, equipa e booking online numa app feita para operar rápido e parecer profissional.
            </p>
          </article>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-[#D8C3A5]/70 bg-[#FFF7EC] p-5 shadow-sm">
                <p className={`text-xl ${titleClass}`}>{feature.title}</p>
                <p className="mt-3 text-sm leading-6 text-[#5B4F3A]/80">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${luxuryMutedPanelClass} p-6 md:p-8`}>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A86840]">Como funciona</p>
            <h2 className={`mt-3 text-3xl md:text-5xl ${titleClass}`}>
              Três passos. Rápido, direto e pronto a vender.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((item) => (
              <article key={item.step} className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-5">
                <span className="inline-flex rounded-full bg-[#A86840] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#FFF7EC]">
                  {item.step}
                </span>
                <h3 className={`mt-4 text-2xl ${titleClass}`}>{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#5B4F3A]/80">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className={`${luxuryPanelClass} p-6 md:p-8`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A86840]">Demonstração</p>
                <h2 className={`mt-3 text-3xl md:text-5xl ${titleClass}`}>
                  Estrutura pronta para screenshots reais do produto.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#5B4F3A]/80">
                  Cada bloco foi preparado para receber capturas reais do backoffice, da agenda e do booking público.
                </p>
              </div>
              <Link href="/book/barbearia-token-premium" className={luxuryGhostButtonClass}>
                Abrir demonstração
              </Link>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              {demoBlocks.map((item) => (
                <article key={item.title} className="rounded-2xl border border-[#D8C3A5]/70 bg-[#FFF7EC] p-4">
                  <h3 className={`text-2xl ${titleClass}`}>{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#2B2118]/60">{item.description}</p>
                  <div className="mt-5 min-h-72 rounded-[24px] border border-dashed border-[#D8C3A5] bg-[#F8E8D3] p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A86840]">Screenshot real aqui</p>
                    <p className="mt-4 text-sm leading-6 text-[#5B4F3A]/80">
                      Substitui este espaço por uma captura do produto ou fotografia da tua barbearia.
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className={`${luxuryMutedPanelClass} p-6 md:p-8`}>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A86840]">Prova local</p>
            <h2 className={`mt-3 text-3xl md:text-5xl ${titleClass}`}>
              Criado nos Açores para barbearias que querem crescer a sério.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#5B4F3A]/80">
              O BarberBook nasceu com contexto local, foco em operação real e uma linguagem visual feita para marcas que querem aparecer melhor no dia a dia.
            </p>
            <div className="mt-8 rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2B2118]/50">Contexto</p>
              <p className={`mt-3 text-2xl ${titleClass}`}>Açores · Atlantic/Azores</p>
            </div>
          </article>
        </section>

        <section className={`${luxuryPanelClass} p-6 md:p-8`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A86840]">Preço</p>
              <h2 className={`mt-3 text-3xl md:text-5xl ${titleClass}`}>BarberBook Premium</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5B4F3A]/75">
              Um plano simples para arrancar rápido e meter a barbearia a funcionar com mais controlo.
            </p>
          </div>

          <div className="mt-8 rounded-[28px] border border-[#D8C3A5]/70 bg-[#FFF7EC] p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-[#A86840] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#FFF7EC]">
                  BarberBook Premium
                </span>
                <h3 className={`mt-3 text-3xl ${titleClass}`}>Tudo num só sistema</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#5B4F3A]/80">
                  Agenda, equipa, clientes e booking online com uma apresentação mais forte e uma operação muito mais simples.
                </p>
              </div>
              <p className={`text-5xl ${titleClass}`}>
                10€
                <span className="ml-1 text-base font-medium text-[#5B4F3A]/70">/mês</span>
              </p>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-[#5B4F3A]/85 md:grid-cols-2">
              <div className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">Agenda diária e controlo de estados</div>
              <div className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">Link público para booking online</div>
              <div className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">Gestão de barbeiros, serviços e clientes</div>
              <div className="rounded-2xl border border-[#D8C3A5]/70 bg-[#F8E8D3] p-4">Backoffice moderno pronto para usar</div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className={primaryButton}>
                Começar agora
              </Link>
              <Link href="/book/barbearia-token-premium" className={luxurySecondaryButtonClass}>
                Ver demonstração
              </Link>
            </div>
          </div>
        </section>

        <section className={`${luxuryPanelClass} px-6 py-8 md:px-10`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A86840]">CTA final</p>
              <h2 className={`mt-3 text-4xl md:text-6xl ${titleClass}`}>
                Está na altura de meter a tua barbearia a funcionar como uma marca a sério.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#5B4F3A]/82">
                Cria a conta, ativa o BarberBook e para de perder tempo com mensagens, confusão e agenda mal gerida.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className={primaryButton}>
                Começa hoje com o BarberBook
              </Link>
              <Link href="/login" className={luxurySecondaryButtonClass}>
                Entrar
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
