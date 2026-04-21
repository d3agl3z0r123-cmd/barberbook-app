import Link from "next/link";
import { getDashboardData } from "@/lib/api";

function badgeClass(status: "Confirmado" | "Aguardando" | "Concluido") {
  if (status === "Confirmado") {
    return "bg-moss/10 text-moss";
  }

  if (status === "Aguardando") {
    return "bg-ember/10 text-ember";
  }

  return "bg-black/8 text-black/60";
}

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  return (
    <main className="section-shell py-8">
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        <aside className="card bg-[#1d1712] p-5 text-white">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Barbearia</p>
            <h1 className="mt-2 text-3xl">{dashboard.shopName}</h1>
            <p className="mt-2 text-sm text-white/65">{dashboard.shopDescription}</p>
          </div>

          <nav className="mt-6 space-y-2 text-sm">
            {["Resumo", "Agenda", "Clientes", "Equipe", "Financeiro", "Planos"].map((item, index) => (
              <div
                key={item}
                className={`rounded-2xl px-4 py-3 ${index === 0 ? "bg-white text-ink" : "text-white/74"}`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-[#2b241e] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Upgrade</p>
            <p className="mt-2 text-lg font-semibold">Ative lembretes por WhatsApp</p>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Reduza faltas e confirme atendimentos automaticamente com um fluxo simples.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/45">
              Fonte: {dashboard.source === "api" ? "Laravel API" : "modo demo"}
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <header className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-black/45">Dashboard</p>
              <h2 className="mt-2 text-4xl">Operacao em tempo real</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/book/${dashboard.bookingSlug}`}
                className="rounded-full bg-[#1d1712] px-5 py-3 text-sm font-semibold text-white"
              >
                Abrir link de agendamento
              </Link>
              <Link
                href="/"
                className="rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-black/75"
              >
                Voltar para landing
              </Link>
            </div>
          </header>

          <div className="grid gap-4 xl:grid-cols-4">
            {dashboard.metrics.map((metric) => (
              <article key={metric.label} className="card p-5">
                <p className="text-sm text-black/52">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
                <p className="mt-2 text-sm text-black/60">{metric.note}</p>
              </article>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-black/45">Agenda de hoje</p>
                  <h3 className="mt-2 text-3xl">Atendimentos confirmados</h3>
                </div>
                <div className="rounded-full bg-moss/10 px-4 py-2 text-sm font-semibold text-moss">
                  Timezone Atlantic/Azores
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
                <table className="min-w-full bg-white text-left text-sm">
                  <thead className="bg-black/5 text-black/55">
                    <tr>
                      <th className="px-4 py-3 font-medium">Hora</th>
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Serviço</th>
                      <th className="px-4 py-3 font-medium">Barbeiro</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.appointments.map((appointment) => (
                      <tr key={`${appointment.time}-${appointment.client}`} className="border-t border-black/6">
                        <td className="px-4 py-4 font-semibold">{appointment.time}</td>
                        <td className="px-4 py-4">{appointment.client}</td>
                        <td className="px-4 py-4">{appointment.service}</td>
                        <td className="px-4 py-4">{appointment.barber}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <div className="space-y-6">
              <article className="card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-black/45">Equipe</p>
                <h3 className="mt-2 text-3xl">Performance do dia</h3>
                <div className="mt-5 space-y-4">
                  {dashboard.team.map((member) => (
                    <div key={member.name} className="rounded-[22px] border border-black/8 bg-blush p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-black/55">{member.role}</p>
                        </div>
                        <p className="text-sm font-semibold text-moss">{member.rating} estrelas</p>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-black/8">
                        <div
                          className="h-2 rounded-full bg-ember"
                          style={{ width: `${Math.min(member.bookingsToday * 11, 100)}%` }}
                        />
                      </div>
                      <p className="mt-3 text-sm text-black/62">{member.bookingsToday} atendimentos hoje</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="card p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-black/45">Serviços</p>
                <h3 className="mt-2 text-3xl">Tabela ativa</h3>
                <div className="mt-5 space-y-3">
                  {dashboard.services.map((service) => (
                    <div key={service.name} className="flex items-center justify-between rounded-[20px] border border-black/8 px-4 py-4">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-black/55">{service.duration}</p>
                      </div>
                      <span className="rounded-full bg-[#1d1712] px-3 py-2 text-sm font-semibold text-white">
                        {service.price}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
