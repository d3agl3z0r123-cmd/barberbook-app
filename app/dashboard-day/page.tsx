"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  EmptyState,
  InternalShell,
  SectionCard,
  StatusNotice,
  ghostButtonClass,
  inputClass,
  whiteCardClass,
} from "@/components/app-ui";

const API_BASE_URL = "http://127.0.0.1:8000/api";
const TOKEN_STORAGE_KEY = "token";
const DAY_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
];

type DayAppointment = {
  id: number;
  client_name: string;
  client_phone: string;
  starts_at: string;
  ends_at: string;
  status: "booked" | "completed" | "cancelled";
  barber: { id: number; name: string } | null;
  service: { id: number; name: string } | null;
};

type DayPayload = {
  date: string;
  timezone: string;
  summary: {
    total: number;
    booked: number;
    completed: number;
    cancelled: number;
    upcoming: number;
  };
  appointments: DayAppointment[];
};

type UserPayload = {
  user: {
    id: number;
    name: string;
    email: string;
    barbershop?: {
      id: number;
      name: string;
      slug: string;
      timezone: string;
    } | null;
  } | null;
};

type BarbershopPayload = {
  barbershop?: {
    id: number;
    name: string;
    slug: string;
    timezone: string;
  };
  message?: string;
};

function getTodayInAzores() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Atlantic/Azores",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

function parseResponse<T>(text: string): T | null {
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch {
    return null;
  }
}

function statusBadge(status: DayAppointment["status"]) {
  if (status === "booked") return "border border-amber-200 bg-amber-100 text-amber-800";
  if (status === "completed") return "border border-emerald-200 bg-emerald-100 text-emerald-800";
  if (status === "cancelled") return "border border-rose-200 bg-rose-100 text-rose-700";

  return "border border-neutral-200 bg-neutral-100 text-neutral-500";
}

function formatDayTitle(date: string, timezone: string) {
  const parsed = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: timezone || "Atlantic/Azores",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(parsed);
}

function formatSelectedDate(date: string, timezone: string) {
  const parsed = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: timezone || "Atlantic/Azores",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function formatStatusLabel(status: DayAppointment["status"]) {
  if (status === "booked") return "Booked";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";

  return status;
}

function sameSlot(appointment: DayAppointment, slot: string) {
  return appointment.starts_at.slice(11, 16) === slot;
}

function slotIsCovered(appointment: DayAppointment, slot: string) {
  const slotDate = new Date(`${appointment.starts_at.slice(0, 10)}T${slot}:00`);
  const start = new Date(appointment.starts_at);
  const end = new Date(appointment.ends_at);

  return slotDate >= start && slotDate < end;
}

export default function DashboardDayPage() {
  const [token, setToken] = useState("");
  const [selectedDate, setSelectedDate] = useState(getTodayInAzores());
  const [payload, setPayload] = useState<DayPayload | null>(null);
  const [authUser, setAuthUser] = useState<UserPayload["user"] | null>(null);
  const [barbershopName, setBarbershopName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasNoBarbershop, setHasNoBarbershop] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) {
      setPayload(null);
      setAuthUser(null);
      setBarbershopName("");
      setHasNoBarbershop(false);
      return;
    }

    let active = true;

    async function loadDayAgenda() {
      setIsLoading(true);
      setError("");
      setHasNoBarbershop(false);

      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const [userResponse, barbershopResponse, agendaResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/user`, { headers }),
          fetch(`${API_BASE_URL}/barbershop`, { headers }),
          fetch(`${API_BASE_URL}/appointments/day?date=${selectedDate}`, { headers }),
        ]);

        const userText = await userResponse.text();
        const barbershopText = await barbershopResponse.text();
        const agendaText = await agendaResponse.text();
        const parsedUser = parseResponse<UserPayload>(userText);
        const parsedBarbershop = parseResponse<BarbershopPayload>(barbershopText);
        const parsedAgenda = parseResponse<DayPayload & { message?: string }>(agendaText);

        if (!active) {
          return;
        }

        setAuthUser(parsedUser?.user ?? null);
        setBarbershopName(parsedBarbershop?.barbershop?.name ?? parsedUser?.user?.barbershop?.name ?? "");

        if (barbershopResponse.status === 404 || agendaResponse.status === 404) {
          setPayload(null);
          setHasNoBarbershop(true);
          setError(parsedAgenda?.message ?? parsedBarbershop?.message ?? "Ainda nao tens nenhuma barbearia criada.");
          return;
        }

        if (!agendaResponse.ok) {
          setPayload(null);
          setError(parsedAgenda?.message ?? "Nao foi possivel carregar a agenda deste dia.");
          return;
        }

        setPayload(parsedAgenda);
      } catch {
        if (!active) {
          return;
        }

        setPayload(null);
        setError("Nao foi possivel contactar o backend Laravel.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDayAgenda();

    return () => {
      active = false;
    };
  }, [selectedDate, token]);

  const nextAppointments = useMemo(
    () => (payload?.appointments ?? []).filter((appointment) => new Date(appointment.starts_at) >= new Date()).slice(0, 5),
    [payload]
  );

  const appointments = payload?.appointments ?? [];
  const timezone = payload?.timezone ?? authUser?.barbershop?.timezone ?? "Atlantic/Azores";
  const selectedDateLabel = formatSelectedDate(selectedDate, timezone);

  return (
    <InternalShell
      currentPath="/dashboard-day"
      title="Agenda diaria"
      subtitle="Vista operacional do dia com resumo, proximas marcacoes e agenda visual em slots de 30 minutos."
      userLabel={authUser?.name ?? (token ? "Sessao ativa" : "Sem sessao ativa")}
      shopLabel={barbershopName || "Ainda sem barbearia"}
    >
      <div className="space-y-6">
        <SectionCard
          title={payload ? formatDayTitle(payload.date, timezone) : "Seleciona uma data"}
          subtitle={`Data selecionada: ${selectedDateLabel} | Timezone: ${timezone}`}
          actions={
            <>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className={inputClass}
              />
              <button type="button" onClick={() => setSelectedDate(getTodayInAzores())} className={ghostButtonClass}>
                Voltar para hoje
              </button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total de hoje", value: payload?.summary.total ?? 0, note: "Marcacoes do dia selecionado" },
              { label: "Booked", value: payload?.summary.booked ?? 0, note: "Prontas para atendimento" },
              { label: "Concluidas", value: payload?.summary.completed ?? 0, note: "Finalizadas com sucesso" },
              { label: "Canceladas", value: payload?.summary.cancelled ?? 0, note: "Nao entram na producao" },
            ].map((metric) => (
              <article key={metric.label} className={`${whiteCardClass} p-5`}>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-500">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-neutral-950">{metric.value}</p>
                <p className="mt-2 text-sm text-neutral-500">{metric.note}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        {!token ? (
          <SectionCard title="Login necessario">
            <EmptyState title="Autenticacao em falta" body="Faz login em /auth-test para abrir a agenda diaria do teu backoffice." />
          </SectionCard>
        ) : null}

        {token && isLoading ? (
          <SectionCard title="A carregar agenda">
            <StatusNotice
              kind="idle"
              title="A preparar o dia"
              body="Estamos a carregar marcacoes, contadores e a agenda visual para a data selecionada."
            />
          </SectionCard>
        ) : null}

        {token && !isLoading && hasNoBarbershop ? (
          <SectionCard title="Barbearia em falta">
            <StatusNotice
              kind="idle"
              title="Ainda nao tens nenhuma barbearia criada."
              body="Cria primeiro a tua unidade para comecares a usar a agenda diaria."
            />
            <div className="mt-4">
              <Link href="/barbershop-test" className={ghostButtonClass}>
                Criar barbearia agora
              </Link>
            </div>
          </SectionCard>
        ) : null}

        {token && !isLoading && error && !hasNoBarbershop ? (
          <SectionCard title="Erro da agenda">
            <StatusNotice kind="error" title="Erro ao carregar agenda" body={error} />
          </SectionCard>
        ) : null}

        {token && !isLoading && !error && !hasNoBarbershop && payload ? (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <SectionCard title="Agenda visual" subtitle={`${appointments.length} marcacoes distribuidas por slots de 30 minutos.`}>
              {appointments.length === 0 ? (
                <EmptyState title="Sem agendamentos neste dia" body="Quando entrarem novas marcacoes, vais ve-las organizadas por slot." />
              ) : (
                <div className="space-y-3">
                  {DAY_SLOTS.map((slot) => {
                    const appointmentAtSlot = appointments.find((appointment) => sameSlot(appointment, slot));
                    const coveredByAppointment = appointments.find((appointment) => slotIsCovered(appointment, slot));

                    if (appointmentAtSlot) {
                      return (
                        <div key={slot} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 shadow-sm">
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">{slot}</p>
                              <p className="mt-2 text-lg font-semibold text-neutral-950">{appointmentAtSlot.client_name}</p>
                              <p className="mt-1 text-sm text-neutral-500">
                                {appointmentAtSlot.service?.name ?? "Servico"} com {appointmentAtSlot.barber?.name ?? "Barbeiro"}
                              </p>
                              <p className="mt-1 text-sm text-neutral-500">{appointmentAtSlot.client_phone}</p>
                            </div>
                            <span className={`rounded-full px-3 py-2 text-xs font-semibold ${statusBadge(appointmentAtSlot.status)}`}>
                              {formatStatusLabel(appointmentAtSlot.status)}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    if (coveredByAppointment) {
                      return (
                        <div key={slot} className="rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-4 text-sm text-neutral-500">
                          <p className="font-semibold text-neutral-800">{slot}</p>
                          <p className="mt-1">Slot ocupado pela marcacao de {coveredByAppointment.client_name}.</p>
                        </div>
                      );
                    }

                    return (
                      <div key={slot} className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-4 text-sm text-neutral-500">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-neutral-800">{slot}</p>
                          <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-500">
                            Livre
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <div className="space-y-6">
              <SectionCard title="Proximas marcacoes" subtitle="Linha de atendimento para este dia.">
                {nextAppointments.length === 0 ? (
                  <EmptyState title="Sem proximas marcacoes" body="Nao ha agendamentos futuros para esta data." />
                ) : (
                  <div className="space-y-3">
                    {nextAppointments.map((appointment) => (
                      <div key={appointment.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-neutral-950">{appointment.client_name}</p>
                            <p className="text-sm text-neutral-500">
                              {appointment.starts_at.slice(11, 16)} · {appointment.service?.name ?? "Servico"}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(appointment.status)}`}>
                            {formatStatusLabel(appointment.status)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-neutral-500">{appointment.barber?.name ?? "Barbeiro"}</p>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Lista por hora" subtitle="Resumo rapido da ordem do dia.">
                {appointments.length === 0 ? (
                  <EmptyState title="Sem agendamentos neste dia" body="Escolhe outra data ou cria novas marcacoes para preencher esta agenda." />
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between rounded-2xl border border-neutral-200 px-4 py-4">
                        <div>
                          <p className="font-semibold text-neutral-950">{appointment.starts_at.slice(11, 16)} · {appointment.client_name}</p>
                          <p className="text-sm text-neutral-500">
                            {appointment.service?.name ?? "Servico"} · {appointment.barber?.name ?? "Barbeiro"}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-2 text-xs font-semibold ${statusBadge(appointment.status)}`}>
                          {formatStatusLabel(appointment.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        ) : null}
      </div>
    </InternalShell>
  );
}
