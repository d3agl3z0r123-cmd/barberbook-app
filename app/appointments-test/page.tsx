"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  DataPreview,
  EmptyState,
  InternalShell,
  SectionCard,
  StatusNotice,
  ghostButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/app-ui";
import { apiUrl } from "@/lib/api-url";

const TOKEN_STORAGE_KEY = "token";

type Barber = {
  id: number;
  name: string;
};

type Service = {
  id: number;
  name: string;
  price: string;
  duration_minutes: number;
};

type Appointment = {
  id: number;
  barber_id: number;
  service_id: number;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  status: "booked" | "completed" | "cancelled";
  barber: Barber | null;
  service: Service | null;
};

type StatusState = {
  kind: "idle" | "success" | "error";
  title: string;
  body: string;
};

async function parseResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function AppointmentsTestPage() {
  const [token, setToken] = useState("");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    id: "",
    barber_id: "",
    service_id: "",
    client_name: "",
    client_phone: "",
    client_email: "",
    starts_at: "",
    notes: "",
    status: "booked",
  });
  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    title: "Pronto para agendar",
    body: "Cria, edita e remove agendamentos da tua barbearia.",
  });
  const [responsePayload, setResponsePayload] = useState("Ainda sem resposta.");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) {
      setAppointments([]);
      setBarbers([]);
      setServices([]);
      return;
    }

    void loadData(token);
  }, [token]);

  async function apiRequest(path: string, init?: RequestInit) {
    const response = await fetch(apiUrl(path), {
      ...init,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });

    const payload = await parseResponse(response);

    return { response, payload };
  }

  async function loadData(currentToken: string) {
    setIsLoading(true);

    try {
      const [barbersResponse, servicesResponse, appointmentsResponse] = await Promise.all([
        fetch(apiUrl("/barbers"), {
          headers: { Accept: "application/json", Authorization: `Bearer ${currentToken}` },
        }),
        fetch(apiUrl("/services"), {
          headers: { Accept: "application/json", Authorization: `Bearer ${currentToken}` },
        }),
        fetch(apiUrl("/appointments"), {
          headers: { Accept: "application/json", Authorization: `Bearer ${currentToken}` },
        }),
      ]);

      const barbersPayload = await parseResponse(barbersResponse);
      const servicesPayload = await parseResponse(servicesResponse);
      const appointmentsPayload = await parseResponse(appointmentsResponse);

      if (!barbersResponse.ok || !servicesResponse.ok || !appointmentsResponse.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao carregar agendamentos",
          body: "Verifica se já criaste a barbearia, barbeiros e serviços antes de agendar.",
        });
        setResponsePayload(JSON.stringify({
          barbers: barbersPayload,
          services: servicesPayload,
          appointments: appointmentsPayload,
        }, null, 2));
        return;
      }

      setBarbers(barbersPayload.barbers ?? []);
      setServices(servicesPayload.services ?? []);
      setAppointments(appointmentsPayload.appointments ?? []);
      setStatus({
        kind: "success",
        title: "Dados carregados",
        body: "Barbeiros, serviços e agendamentos foram carregados com sucesso.",
      });
      setResponsePayload(JSON.stringify({
        barbers: barbersPayload.barbers ?? [],
        services: servicesPayload.services ?? [],
        appointments: appointmentsPayload.appointments ?? [],
      }, null, 2));
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Não foi possível ligar ao serviço neste momento.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus({
        kind: "error",
        title: "Entrar necessário",
        body: "Faz primeiro login em /auth-test.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { response, payload } = await apiRequest(
        form.id ? `/appointments/${form.id}` : "/appointments",
        {
          method: form.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            barber_id: Number(form.barber_id),
            service_id: Number(form.service_id),
            client_name: form.client_name,
            client_phone: form.client_phone,
            client_email: form.client_email || null,
            starts_at: form.starts_at,
            notes: form.notes || null,
            status: form.status,
          }),
        }
      );

      if (!response.ok) {
        const slotUnavailableMessage =
          payload?.errors?.starts_at?.[0] === "Este horário já não está disponível" ||
          payload?.message === "Este horário já não está disponível";

        setStatus({
          kind: "error",
          title: "Erro ao guardar agendamento",
          body: slotUnavailableMessage
            ? "Este horário acabou de ficar indisponível. Escolhe outro."
            : "O backend devolveu um erro ao criar ou atualizar o agendamento. Se houver conflito, vais ve-lo abaixo.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      setForm({
        id: "",
        barber_id: "",
        service_id: "",
        client_name: "",
        client_phone: "",
        client_email: "",
        starts_at: "",
        notes: "",
        status: "booked",
      });
      setStatus({
        kind: "success",
        title: form.id ? "Agendamento atualizado" : "Agendamento criado",
        body: "O agendamento foi guardado com sucesso.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
      await loadData(token);
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Não foi possível ligar ao serviço neste momento.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const { response, payload } = await apiRequest(`/appointments/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatus({
        kind: "error",
        title: "Erro ao apagar agendamento",
        body: "O backend devolveu um erro ao apagar o agendamento.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
      return;
    }

    setStatus({
      kind: "success",
      title: "Agendamento removido",
      body: "O agendamento foi removido com sucesso.",
    });
    setResponsePayload(JSON.stringify(payload, null, 2));
    await loadData(token);
  }

  return (
    <InternalShell
      currentPath="/appointments-test"
      title="Agendamentos"
      subtitle="Gestão interna da agenda com barbeiro, serviço, cliente e horário."
      userLabel={token ? "Sessão ativa" : "Sem sessão ativa"}
    >
      {!token ? (
        <SectionCard title="Entrar necessário">
          <EmptyState title="Autenticação em falta" body="Faz login em /auth-test, cria a barbearia e configura barbeiros e serviços." />
        </SectionCard>
      ) : (
        <div className="space-y-6">
          <SectionCard title="Estado da agenda">
            <StatusNotice kind={status.kind} title={status.title} body={status.body} meta={isLoading ? "A carregar..." : "Pronto."} />
          </SectionCard>

          {barbers.length === 0 ? (
            <SectionCard title="Barbeiros em falta">
              <EmptyState title="Sem barbeiros" body="Cria primeiro pelo menos um barbeiro em /management-test." />
            </SectionCard>
          ) : null}

          {services.length === 0 ? (
            <SectionCard title="Serviços em falta">
              <EmptyState title="Sem serviços" body="Cria primeiro pelo menos um serviço em /management-test." />
            </SectionCard>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <SectionCard title={form.id ? "Editar agendamento" : "Criar agendamento"}>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-neutral-700">Barbeiro</span>
                  <select
                    className={inputClass}
                    value={form.barber_id}
                    onChange={(event) => setForm((current) => ({ ...current, barber_id: event.target.value }))}
                  >
                    <option value="">Selecionar barbeiro</option>
                    {barbers.map((barber) => (
                      <option key={barber.id} value={barber.id}>
                        {barber.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-neutral-700">Serviço</span>
                  <select
                    className={inputClass}
                    value={form.service_id}
                    onChange={(event) => setForm((current) => ({ ...current, service_id: event.target.value }))}
                  >
                    <option value="">Selecionar serviço</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} ({service.duration_minutes} min)
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-neutral-700">Nome do cliente</span>
                  <input
                    className={inputClass}
                    placeholder="Nome do cliente"
                    value={form.client_name}
                    onChange={(event) => setForm((current) => ({ ...current, client_name: event.target.value }))}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-neutral-700">Telefone do cliente</span>
                  <input
                    className={inputClass}
                    placeholder="Telefone do cliente"
                    value={form.client_phone}
                    onChange={(event) => setForm((current) => ({ ...current, client_phone: event.target.value }))}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-neutral-700">E-mail do cliente</span>
                  <input
                    className={inputClass}
                    placeholder="E-mail do cliente"
                    value={form.client_email}
                    onChange={(event) => setForm((current) => ({ ...current, client_email: event.target.value }))}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-neutral-700">Inicio</span>
                  <input
                    className={inputClass}
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))}
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-neutral-700">Estado</span>
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as "booked" | "completed" | "cancelled",
                      }))
                    }
                  >
                    <option value="booked">booked</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-neutral-700">Notas</span>
                  <textarea
                    className={`${inputClass} min-h-24`}
                    placeholder="Notas"
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  />
                </label>

                <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || barbers.length === 0 || services.length === 0}
                    className={primaryButtonClass}
                  >
                    {isSubmitting ? "A guardar..." : form.id ? "Atualizar agendamento" : "Criar agendamento"}
                  </button>
                  {form.id ? (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          id: "",
                          barber_id: "",
                          service_id: "",
                          client_name: "",
                          client_phone: "",
                          client_email: "",
                          starts_at: "",
                          notes: "",
                          status: "booked",
                        })
                      }
                      className={secondaryButtonClass}
                    >
                      Cancelar edicao
                    </button>
                  ) : null}
                </div>
              </form>
            </SectionCard>

            <SectionCard
              title="Agendamentos"
              actions={
                <button
                  type="button"
                  onClick={() => void loadData(token)}
                  className={ghostButtonClass}
                >
                  Recarregar
                </button>
              }
            >
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <EmptyState title="Ainda sem agendamentos" body="Cria a primeira marcação para preencher a agenda." />
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-2xl border border-neutral-200 p-4 transition-all hover:border-neutral-300 hover:shadow-sm">
                      <p className="font-medium text-neutral-950">{appointment.client_name}</p>
                      <p className="mt-1 text-sm text-neutral-500">{appointment.client_phone}</p>
                      <p className="mt-1 text-sm text-neutral-500">
                        {appointment.barber?.name} | {appointment.service?.name}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Inicio: {appointment.starts_at}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Fim: {appointment.ends_at}
                      </p>
                      <p className="mt-1 text-sm text-neutral-500">Estado: {appointment.status}</p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              id: String(appointment.id),
                              barber_id: String(appointment.barber_id),
                              service_id: String(appointment.service_id),
                              client_name: appointment.client_name,
                              client_phone: appointment.client_phone,
                              client_email: appointment.client_email ?? "",
                              starts_at: toDatetimeLocal(appointment.starts_at),
                              notes: appointment.notes ?? "",
                              status: appointment.status,
                            })
                          }
                          className={ghostButtonClass}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(appointment.id)}
                          className={ghostButtonClass}
                        >
                          Apagar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>
          </div>

          <DataPreview title="Resposta do backend">
            <pre>{responsePayload}</pre>
          </DataPreview>
        </div>
      )}
    </InternalShell>
  );
}
