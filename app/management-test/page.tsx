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

const API_BASE_URL = "http://127.0.0.1:8000/api";
const TOKEN_STORAGE_KEY = "token";

type Barber = {
  id: number;
  barbershop_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

type Service = {
  id: number;
  barbershop_id: number;
  name: string;
  price: string;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
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

export default function ManagementTestPage() {
  const [token, setToken] = useState("");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barberForm, setBarberForm] = useState({ id: "", name: "", email: "", phone: "" });
  const [serviceForm, setServiceForm] = useState({ id: "", name: "", price: "", duration_minutes: "" });
  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    title: "Pronto para gerir",
    body: "Usa esta pagina para criar, editar e apagar barbeiros e servicos.",
  });
  const [responsePayload, setResponsePayload] = useState("Ainda sem resposta.");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingBarber, setIsSubmittingBarber] = useState(false);
  const [isSubmittingService, setIsSubmittingService] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token) {
      setBarbers([]);
      setServices([]);
      return;
    }

    void loadManagement(token);
  }, [token]);

  async function apiRequest(path: string, init?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
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

  async function loadManagement(currentToken: string) {
    setIsLoading(true);

    try {
      const [barbersResponse, servicesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/barbers`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        }),
        fetch(`${API_BASE_URL}/services`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        }),
      ]);

      const barbersPayload = await parseResponse(barbersResponse);
      const servicesPayload = await parseResponse(servicesResponse);

      if (!barbersResponse.ok || !servicesResponse.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao carregar gestao",
          body: "Verifica se ja criaste a tua barbearia antes de gerir barbeiros e servicos.",
        });
        setResponsePayload(
          JSON.stringify(
            { barbers: barbersPayload, services: servicesPayload },
            null,
            2
          )
        );
        return;
      }

      setBarbers(barbersPayload.barbers ?? []);
      setServices(servicesPayload.services ?? []);
      setStatus({
        kind: "success",
        title: "Gestao carregada",
        body: "Barbeiros e servicos da tua barbearia foram carregados com sucesso.",
      });
      setResponsePayload(
        JSON.stringify(
          { barbers: barbersPayload.barbers ?? [], services: servicesPayload.services ?? [] },
          null,
          2
        )
      );
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Nao foi possivel contactar o backend Laravel.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBarberSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus({
        kind: "error",
        title: "Login necessario",
        body: "Faz primeiro login em /auth-test.",
      });
      return;
    }

    setIsSubmittingBarber(true);

    try {
      const { response, payload } = await apiRequest(
        barberForm.id ? `/barbers/${barberForm.id}` : "/barbers",
        {
          method: barberForm.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: barberForm.name,
            email: barberForm.email || null,
            phone: barberForm.phone || null,
          }),
        }
      );

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao guardar barbeiro",
          body: "O backend devolveu um erro ao criar ou atualizar o barbeiro.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      setBarberForm({ id: "", name: "", email: "", phone: "" });
      setStatus({
        kind: "success",
        title: barberForm.id ? "Barbeiro atualizado" : "Barbeiro criado",
        body: "Os dados do barbeiro foram guardados com sucesso.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
      await loadManagement(token);
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Nao foi possivel contactar o backend Laravel.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsSubmittingBarber(false);
    }
  }

  async function handleServiceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus({
        kind: "error",
        title: "Login necessario",
        body: "Faz primeiro login em /auth-test.",
      });
      return;
    }

    setIsSubmittingService(true);

    try {
      const { response, payload } = await apiRequest(
        serviceForm.id ? `/services/${serviceForm.id}` : "/services",
        {
          method: serviceForm.id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: serviceForm.name,
            price: serviceForm.price,
            duration_minutes: Number(serviceForm.duration_minutes),
          }),
        }
      );

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao guardar servico",
          body: "O backend devolveu um erro ao criar ou atualizar o servico.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      setServiceForm({ id: "", name: "", price: "", duration_minutes: "" });
      setStatus({
        kind: "success",
        title: serviceForm.id ? "Servico atualizado" : "Servico criado",
        body: "Os dados do servico foram guardados com sucesso.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
      await loadManagement(token);
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Nao foi possivel contactar o backend Laravel.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsSubmittingService(false);
    }
  }

  async function handleDeleteBarber(id: number) {
    const { response, payload } = await apiRequest(`/barbers/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatus({
        kind: "error",
        title: "Erro ao apagar barbeiro",
        body: "O backend devolveu um erro ao remover o barbeiro.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
      return;
    }

    setStatus({
      kind: "success",
      title: "Barbeiro removido",
      body: "O barbeiro foi removido com sucesso.",
    });
    setResponsePayload(JSON.stringify(payload, null, 2));
    await loadManagement(token);
  }

  async function handleDeleteService(id: number) {
    const { response, payload } = await apiRequest(`/services/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setStatus({
        kind: "error",
        title: "Erro ao apagar servico",
        body: "O backend devolveu um erro ao remover o servico.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
      return;
    }

    setStatus({
      kind: "success",
      title: "Servico removido",
      body: "O servico foi removido com sucesso.",
    });
    setResponsePayload(JSON.stringify(payload, null, 2));
    await loadManagement(token);
  }

  return (
    <InternalShell
      currentPath="/management-test"
      title="Barbeiros e servicos"
      subtitle="Gestao operacional da equipa e do catalogo de servicos da barbearia."
      userLabel={token ? "Sessao ativa" : "Sem sessao ativa"}
    >
      {!token ? (
        <SectionCard title="Login necessario">
          <EmptyState title="Autenticacao em falta" body="Primeiro faz login em /auth-test e cria a tua barbearia em /barbershop-test." />
        </SectionCard>
      ) : (
        <div className="space-y-6">
          <SectionCard title="Estado da gestao">
            <StatusNotice kind={status.kind} title={status.title} body={status.body} meta={isLoading ? "A carregar..." : "Pronto."} />
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <SectionCard title={barberForm.id ? "Editar barbeiro" : "Criar barbeiro"}>
                <form className="grid gap-4" onSubmit={handleBarberSubmit}>
                  <input
                    className={inputClass}
                    placeholder="Nome do barbeiro"
                    value={barberForm.name}
                    onChange={(event) => setBarberForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <input
                    className={inputClass}
                    placeholder="Email"
                    value={barberForm.email}
                    onChange={(event) => setBarberForm((current) => ({ ...current, email: event.target.value }))}
                  />
                  <input
                    className={inputClass}
                    placeholder="Telefone"
                    value={barberForm.phone}
                    onChange={(event) => setBarberForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                  <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingBarber}
                    className={primaryButtonClass}
                  >
                    {isSubmittingBarber ? "A guardar..." : barberForm.id ? "Atualizar barbeiro" : "Criar barbeiro"}
                  </button>
                  {barberForm.id ? (
                    <button
                      type="button"
                      onClick={() => setBarberForm({ id: "", name: "", email: "", phone: "" })}
                      className={secondaryButtonClass}
                    >
                      Cancelar edicao
                    </button>
                  ) : null}
                  </div>
                </form>
              </SectionCard>

              <SectionCard
                title="Barbeiros"
                actions={
                  <button type="button" onClick={() => void loadManagement(token)} className={ghostButtonClass}>
                    Recarregar
                  </button>
                }
              >
                <div className="flex items-center justify-between gap-4">
                </div>
                <div className="space-y-3">
                  {barbers.length === 0 ? (
                    <EmptyState title="Ainda sem barbeiros" body="Adiciona o primeiro profissional da equipa." />
                  ) : (
                    barbers.map((barber) => (
                      <div key={barber.id} className="rounded-2xl border border-neutral-200 p-4 transition-all hover:border-neutral-300 hover:shadow-sm">
                        <p className="font-medium text-neutral-950">{barber.name}</p>
                        <p className="mt-1 text-sm text-neutral-500">{barber.email || "Sem email"}</p>
                        <p className="mt-1 text-sm text-neutral-500">{barber.phone || "Sem telefone"}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setBarberForm({
                                id: String(barber.id),
                                name: barber.name,
                                email: barber.email ?? "",
                                phone: barber.phone ?? "",
                              })
                            }
                            className={ghostButtonClass}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteBarber(barber.id)}
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

            <div className="space-y-6">
              <SectionCard title={serviceForm.id ? "Editar servico" : "Criar servico"}>
                <form className="grid gap-4" onSubmit={handleServiceSubmit}>
                  <input
                    className={inputClass}
                    placeholder="Nome do servico"
                    value={serviceForm.name}
                    onChange={(event) => setServiceForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <input
                    className={inputClass}
                    placeholder="Preco"
                    value={serviceForm.price}
                    onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))}
                  />
                  <input
                    className={inputClass}
                    placeholder="Duracao em minutos"
                    value={serviceForm.duration_minutes}
                    onChange={(event) =>
                      setServiceForm((current) => ({ ...current, duration_minutes: event.target.value }))
                    }
                  />
                  <div className="mt-2 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingService}
                    className={primaryButtonClass}
                  >
                    {isSubmittingService ? "A guardar..." : serviceForm.id ? "Atualizar servico" : "Criar servico"}
                  </button>
                  {serviceForm.id ? (
                    <button
                      type="button"
                      onClick={() => setServiceForm({ id: "", name: "", price: "", duration_minutes: "" })}
                      className={secondaryButtonClass}
                    >
                      Cancelar edicao
                    </button>
                  ) : null}
                  </div>
                </form>
              </SectionCard>

              <SectionCard title="Servicos">
                <div className="space-y-3">
                  {services.length === 0 ? (
                    <EmptyState title="Ainda sem servicos" body="Cria o primeiro servico para abrires marcacoes." />
                  ) : (
                    services.map((service) => (
                      <div key={service.id} className="rounded-2xl border border-neutral-200 p-4 transition-all hover:border-neutral-300 hover:shadow-sm">
                        <p className="font-medium text-neutral-950">{service.name}</p>
                        <p className="mt-1 text-sm text-neutral-500">Preco: {service.price} EUR</p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Duracao: {service.duration_minutes} minutos
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setServiceForm({
                                id: String(service.id),
                                name: service.name,
                                price: String(service.price),
                                duration_minutes: String(service.duration_minutes),
                              })
                            }
                            className={ghostButtonClass}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteService(service.id)}
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
          </div>

          <DataPreview title="Resposta do backend">
            <pre>{responsePayload}</pre>
          </DataPreview>
        </div>
      )}
    </InternalShell>
  );
}
