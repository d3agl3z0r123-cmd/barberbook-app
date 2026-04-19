import Link from "next/link";
import {
  luxuryGhostButtonClass,
  luxuryMutedPanelClass,
  luxuryPageClass,
  luxuryPanelClass,
  luxuryPrimaryButtonClass,
  luxurySecondaryButtonClass,
} from "@/components/app-ui";

const painPoints = [
  "Clientes esquecem-se das marcacoes quando tudo fica perdido em mensagens.",
  "Horarios confusos criam atrasos, falhas e stress na operacao diaria.",
  "A equipa perde tempo a responder manualmente no WhatsApp e Instagram.",
  "Sem um sistema central, a barbearia perde controlo do negocio.",
];

const features = [
  {
    title: "Agenda inteligente",
    description: "Ves o dia todo de forma clara, evitas choques de horario e trabalhas com mais ritmo.",
  },
  {
    title: "Link exclusivo de marcacao",
    description: "Recebe marcacoes online num link proprio, simples de partilhar e forte na imagem.",
  },
  {
    title: "Gestao completa de clientes",
    description: "Guarda contactos, historico e contexto para atender melhor e vender mais recorrencia.",
  },
  {
    title: "Organizacao de barbeiros",
    description: "Controla equipa, servicos e disponibilidade num unico sitio.",
  },
  {
    title: "Controlo total num so painel",
    description: "Agenda, equipa e operacao num backoffice feito para andar rapido.",
  },
];

const steps = [
  {
    step: "01",
    title: "Cria a tua barbearia",
    body: "Configura a conta, ajusta a unidade e deixa barbeiros e servicos prontos.",
  },
  {
    step: "02",
    title: "Partilha o teu link",
    body: "Abre o teu booking publico e manda o link para clientes, stories e bio.",
  },
  {
    step: "03",
    title: "Recebe marcacoes automaticamente",
    body: "Menos conversa manual, mais agenda preenchida e mais controlo do dia.",
  },
];

const demoBlocks = [
  {
    title: "Backoffice",
    description: "Espaco pronto para screenshot real do painel interno, com leitura forte e visual de app.",
  },
  {
    title: "Agenda",
    description: "Bloco preparado para mostrar slots, ocupacao e ritmo diario da unidade.",
  },
  {
    title: "Booking publico",
    description: "Area pronta para mostrar a pagina de marcacao usada pelo cliente final.",
  },
];

const statCards = [
  { label: "Marcacoes", value: "24/7", note: "Link sempre ativo" },
  { label: "Operacao", value: "Mais controlo", note: "Menos caos no dia a dia" },
  { label: "Imagem", value: "Mais forte", note: "Marca mais moderna online" },
];

const urbanTitleClass = "font-bold tracking-tight text-[#E8DCCB]";

export default function HomePage() {
  return (
    <main className={luxuryPageClass}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 md:px-6 xl:px-8">
        <header className={`${luxuryMutedPanelClass} flex items-center justify-between gap-4 px-5 py-4`}>
          <div>
            <p className={`text-xl ${urbanTitleClass}`}>BarberPro</p>
            <p className="text-sm text-[#E8DCCB]/45">Urban barber management platform</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/book/barbearia-token-premium" className={luxuryGhostButtonClass}>
              Ver demonstracao
            </Link>
            <Link href="/login" className={luxuryGhostButtonClass}>
              Entrar
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-xl bg-[#A63A3A] px-6 py-3.5 text-sm font-bold text-[#F5F1EA] transition-all hover:bg-[#8D2F2F]">
              Comecar agora
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <div className={`${luxuryPanelClass} overflow-hidden p-8 md:p-10`}>
            <div className="rounded-2xl border border-white/10 bg-[#101010] p-6 md:p-8">
              <span className="inline-flex rounded-full border border-[#A63A3A]/30 bg-[#A63A3A]/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-[#E8DCCB]">
                Urban Barber
              </span>
              <h1 className={`mt-6 max-w-4xl text-5xl leading-[0.95] md:text-7xl ${urbanTitleClass}`}>
                Mete ordem na agenda. Mete mais clientes na cadeira.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#E8DCCB]/72 md:text-lg">
                BarberPro e o sistema de marcacoes para barbearias modernas que querem menos confusao, mais controlo e uma imagem muito mais forte.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-[#A63A3A] px-7 py-4 text-sm font-bold text-[#F5F1EA] transition-all hover:bg-[#8D2F2F]"
                >
                  Comecar agora
                </Link>
                <Link
                  href="/book/barbearia-token-premium"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#1A1A1A] px-7 py-4 text-sm font-bold text-[#E8DCCB] transition-all hover:border-[#A63A3A]/45 hover:bg-[#202020]"
                >
                  Ver demonstracao
                </Link>
              </div>
              <p className="mt-4 text-sm text-[#E8DCCB]/45">
                Feito para barbearias com presenca forte, operacao rapida e foco total no cliente.
              </p>
            </div>
          </div>

          <div className={`${luxuryPanelClass} min-h-[560px] overflow-hidden p-4 md:p-5`}>
            <div className="flex h-full flex-col gap-4 rounded-[28px] border border-white/10 bg-[#1A1A1A] p-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#A63A3A]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              </div>

              <div className="flex-1 rounded-[24px] border border-white/10 bg-[#0F0F0F] p-6">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#A63A3A]">Hero image area</p>
                    <h2 className={`mt-4 max-w-md text-3xl md:text-4xl ${urbanTitleClass}`}>
                      Aqui entra uma imagem grande, crua e forte da tua barbearia.
                    </h2>
                    <p className="mt-4 max-w-md text-sm leading-7 text-[#E8DCCB]/55">
                      Interior da loja, cadeira, corte em detalhe ou uma foto forte de equipa. Menos suavidade, mais impacto.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {statCards.map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-white/10 bg-[#141414] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8DCCB]/45">{metric.label}</p>
                        <p className={`mt-3 text-xl ${urbanTitleClass}`}>{metric.value}</p>
                        <p className="mt-2 text-xs leading-5 text-[#E8DCCB]/50">{metric.note}</p>
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
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A63A3A]">Problema</p>
            <h2 className={`mt-3 text-3xl md:text-5xl ${urbanTitleClass}`}>
              Se a agenda esta espalhada por mensagens, o negocio anda sempre atrasado.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {painPoints.map((pain) => (
              <article key={pain} className="rounded-2xl border border-white/10 bg-[#141414] p-5">
                <p className="text-sm leading-7 text-[#E8DCCB]/68">{pain}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className={`${luxuryMutedPanelClass} p-6 md:p-8`}>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A63A3A]">Solucao</p>
            <h2 className={`mt-3 text-3xl md:text-5xl ${urbanTitleClass}`}>
              Tudo o que precisas para correr a barbearia sem perder tempo.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#E8DCCB]/60">
              O BarberPro junta agenda, clientes, equipa e booking online numa app feita para operar rapido e parecer forte online.
            </p>
          </article>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                <p className={`text-xl ${urbanTitleClass}`}>{feature.title}</p>
                <p className="mt-3 text-sm leading-6 text-[#E8DCCB]/60">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={`${luxuryMutedPanelClass} p-6 md:p-8`}>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A63A3A]">Como funciona</p>
            <h2 className={`mt-3 text-3xl md:text-5xl ${urbanTitleClass}`}>
              Tres passos. Rapido. Direto. Pronto a vender.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {steps.map((item) => (
              <article key={item.step} className="rounded-2xl border border-white/10 bg-[#141414] p-5">
                <span className="inline-flex rounded-full bg-[#A63A3A] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F5F1EA]">
                  {item.step}
                </span>
                <h3 className={`mt-4 text-2xl ${urbanTitleClass}`}>{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#E8DCCB]/60">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className={`${luxuryPanelClass} p-6 md:p-8`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A63A3A]">Demo</p>
                <h2 className={`mt-3 text-3xl md:text-5xl ${urbanTitleClass}`}>
                  Estrutura pronta para screenshots reais, sem ar de mock fraquinho.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#E8DCCB]/60">
                  Cada bloco foi pensado para receber capturas do produto com vibe de app moderna e marca forte.
                </p>
              </div>
              <Link href="/book/barbearia-token-premium" className={luxuryGhostButtonClass}>
                Abrir demo
              </Link>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              {demoBlocks.map((item) => (
                <article key={item.title} className="rounded-2xl border border-white/10 bg-[#121212] p-4">
                  <h3 className={`text-2xl ${urbanTitleClass}`}>{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#E8DCCB]/58">{item.description}</p>

                  <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#1A1A1A]">
                    <div className="flex items-center gap-2 border-b border-white/10 bg-[#111111] px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#A63A3A]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      <div className="ml-3 h-7 flex-1 rounded-full border border-white/10 bg-[#121212] px-3 text-xs leading-7 text-[#E8DCCB]/30">
                        Screenshot real aqui
                      </div>
                    </div>
                    <div className="flex min-h-80 items-end justify-start bg-[#0F0F0F] p-6">
                      <div className="max-w-[16rem] rounded-2xl border border-white/10 bg-[#151515] p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A63A3A]">Visual real</p>
                        <p className="mt-3 text-sm leading-6 text-[#E8DCCB]/68">
                          Troca esta area por uma captura real do produto ou por uma foto forte da tua barbearia.
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className={`${luxuryMutedPanelClass} p-6 md:p-8`}>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A63A3A]">Prova local</p>
            <h2 className={`mt-3 text-3xl md:text-5xl ${urbanTitleClass}`}>
              Criado nos Acores para barbearias que querem crescer a serio.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#E8DCCB]/60">
              O BarberPro nasceu com contexto local, foco em operacao real e uma linguagem visual feita para marcas que querem aparecer melhor nas redes e no dia a dia.
            </p>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E8DCCB]/40">Contexto</p>
                <p className={`mt-3 text-2xl ${urbanTitleClass}`}>Acores · Atlantic/Azores</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#141414] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E8DCCB]/40">Posicionamento</p>
                <p className={`mt-3 text-2xl ${urbanTitleClass}`}>Marca moderna para barbearias com atitude</p>
              </div>
            </div>
          </article>
        </section>

        <section className={`${luxuryPanelClass} p-6 md:p-8`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A63A3A]">Preco</p>
              <h2 className={`mt-3 text-3xl md:text-5xl ${urbanTitleClass}`}>BarberPro Premium</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#E8DCCB]/55">
              Um plano simples para arrancar rapido e meter a barbearia a funcionar com mais controlo.
            </p>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-[#101010] p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-[#A63A3A] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#F5F1EA]">
                  BarberPro Premium
                </span>
                <h3 className={`mt-3 text-3xl ${urbanTitleClass}`}>Tudo num so sistema</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#E8DCCB]/60">
                  Agenda, equipa, clientes e booking online com uma apresentacao mais forte e uma operacao muito mais simples.
                </p>
              </div>
              <p className={`text-5xl ${urbanTitleClass}`}>
                10€
                <span className="ml-1 text-base font-medium text-[#E8DCCB]/45">/mes</span>
              </p>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-[#E8DCCB]/72 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">Agenda diaria e controlo de estados</div>
              <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">Link publico para booking online</div>
              <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">Gestao de barbeiros, servicos e clientes</div>
              <div className="rounded-2xl border border-white/10 bg-[#151515] p-4">Backoffice moderno pronto para usar</div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-[#A63A3A] px-7 py-4 text-sm font-bold text-[#F5F1EA] transition-all hover:bg-[#8D2F2F]"
              >
                Comecar agora
              </Link>
              <Link href="/book/barbearia-token-premium" className={luxurySecondaryButtonClass}>
                Ver demonstracao
              </Link>
            </div>
          </div>
        </section>

        <section className={`${luxuryPanelClass} px-6 py-8 md:px-10`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A63A3A]">CTA final</p>
              <h2 className={`mt-3 text-4xl md:text-6xl ${urbanTitleClass}`}>
                Esta na altura de meter a tua barbearia a funcionar como uma marca a serio.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#E8DCCB]/65">
                Cria a conta, ativa o BarberPro e para de perder tempo com mensagens, confusoes e agenda mal gerida.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-[#A63A3A] px-7 py-4 text-sm font-bold text-[#F5F1EA] transition-all hover:bg-[#8D2F2F]"
              >
                Comeca hoje com o BarberPro
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
