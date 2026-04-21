"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  DataPreview,
  EmptyState,
  InternalShell,
  SectionCard,
  StatusNotice,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/app-ui";
import { apiUrl } from "@/lib/api-url";

const TOKEN_STORAGE_KEY = "token";

type BarbershopPayload = {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  timezone: string;
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

export default function BarbershopTestPage() {
  const [token, setToken] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    phone: "",
    email: "",
    address: "",
    timezone: "Atlantic/Azores",
  });
  const [barbershop, setBarbershop] = useState<BarbershopPayload | null>(null);
  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    title: "Pronto para testar",
    body: "Liga-te com um token valido e cria ou atualiza a tua barbearia.",
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
      setBarbershop(null);
      return;
    }

    void loadBarbershop(token);
  }, [token]);

  async function loadBarbershop(currentToken: string) {
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl("/barbershop"), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const payload = await parseResponse(response);

      if (response.status === 404) {
        setBarbershop(null);
        setStatus({
          kind: "idle",
          title: "Sem barbearia ainda",
          body: "Podes criar agora a primeira barbearia deste utilizador.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao carregar barbearia",
          body: "O backend nao conseguiu devolver a barbearia do utilizador autenticado.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      setBarbershop(payload.barbershop);
      setForm({
        name: payload.barbershop.name ?? "",
        slug: payload.barbershop.slug ?? "",
        phone: payload.barbershop.phone ?? "",
        email: payload.barbershop.email ?? "",
        address: payload.barbershop.address ?? "",
        timezone: payload.barbershop.timezone ?? "Atlantic/Azores",
      });
      setStatus({
        kind: "success",
        title: "Barbearia carregada",
        body: "Os dados atuais da tua barbearia foram carregados com sucesso.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setStatus({
        kind: "error",
        title: "Login necessario",
        body: "Faz primeiro login em /auth-test para obter um Bearer token.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(apiUrl("/barbershop"), {
        method: barbershop ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || undefined,
          phone: form.phone || null,
          email: form.email || null,
          address: form.address || null,
          timezone: form.timezone || "Atlantic/Azores",
        }),
      });

      const payload = await parseResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Erro ao guardar barbearia",
          body: "O backend devolveu um erro ao criar ou atualizar a barbearia.",
        });
        setResponsePayload(JSON.stringify(payload, null, 2));
        return;
      }

      setBarbershop(payload.barbershop);
      setForm({
        name: payload.barbershop.name ?? "",
        slug: payload.barbershop.slug ?? "",
        phone: payload.barbershop.phone ?? "",
        email: payload.barbershop.email ?? "",
        address: payload.barbershop.address ?? "",
        timezone: payload.barbershop.timezone ?? "Atlantic/Azores",
      });
      setStatus({
        kind: "success",
        title: barbershop ? "Barbearia atualizada" : "Barbearia criada",
        body: "Os dados da tua barbearia foram guardados com sucesso.",
      });
      setResponsePayload(JSON.stringify(payload, null, 2));
    } catch (error) {
      setStatus({
        kind: "error",
        title: "Falha de ligacao",
        body: "Nao foi possivel contactar o backend Laravel.",
      });
      setResponsePayload(String(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <InternalShell
      currentPath="/barbershop-test"
      title="Configuracao da barbearia"
      subtitle="Cria e atualiza a unidade principal associada ao utilizador autenticado."
      shopLabel={barbershop?.name}
      userLabel={token ? "Sessao ativa" : "Sem sessao ativa"}
    >
      {!token ? (
        <SectionCard title="Login necessario">
          <EmptyState
            title="Autenticacao em falta"
            body="Primeiro faz login em /auth-test. Esta pagina usa Authorization: Bearer TOKEN."
          />
        </SectionCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <SectionCard title={barbershop ? "Atualizar barbearia" : "Criar barbearia"}>
            <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-neutral-500">
                  {isLoading ? "A carregar dados..." : "Cada utilizador pode ter apenas uma barbearia."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadBarbershop(token)}
                className={secondaryButtonClass}
              >
                Recarregar
              </button>
            </div>
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-neutral-700">Nome</span>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Barbearia Central"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-neutral-700">Slug</span>
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                  placeholder="gerado-automaticamente-se-vazio"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-neutral-700">Telefone</span>
                <input
                  className={inputClass}
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+351 912 345 678"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-neutral-700">Email</span>
                <input
                  className={inputClass}
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="barbearia@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-neutral-700">Morada</span>
                <input
                  className={inputClass}
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  placeholder="Ponta Delgada, Sao Miguel"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-neutral-700">Timezone</span>
                <input
                  className={inputClass}
                  value={form.timezone}
                  onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={primaryButtonClass}
            >
              {isSubmitting ? "A guardar..." : barbershop ? "Atualizar barbearia" : "Criar barbearia"}
            </button>
            </form>
          </SectionCard>

          <div className="space-y-6">
            <SectionCard title="Estado atual">
              <StatusNotice kind={status.kind} title={status.title} body={status.body} />
            </SectionCard>
            <DataPreview title="Barbearia atual">
              <pre>{barbershop ? JSON.stringify(barbershop, null, 2) : "Ainda sem barbearia."}</pre>
            </DataPreview>
            <DataPreview title="Resposta do backend">
              <pre>{responsePayload}</pre>
            </DataPreview>
          </div>
        </div>
      )}
    </InternalShell>
  );
}
