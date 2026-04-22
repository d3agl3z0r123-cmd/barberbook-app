"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusNotice } from "@/components/app-ui";
import {
  MinimalAuthCard,
  MinimalDivider,
  MinimalSocialButton,
  publicInputClass,
  publicPrimaryButtonClass,
} from "@/components/public-ui";
import { apiUrl, googleRedirectUrl } from "@/lib/api-url";

const TOKEN_STORAGE_KEY = "token";
const TOKEN_TYPE_STORAGE_KEY = "token_type";

type StatusState = {
  kind: "idle" | "success" | "error";
  title: string;
  body: string;
};

async function parseApiResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function getRedirectPath(role?: string) {
  if (role === "barber" || role === "owner") {
    return "/backoffice";
  }

  return "/backoffice";
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    title: "Cria a tua conta",
    body: "Começa com o teu e-mail e a tua palavra-passe e depois liga a tua barbearia ao sistema.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);

  function handleGoogleLogin() {
    const redirectUrl = googleRedirectUrl();

    if (!redirectUrl) {
      setStatus({
        kind: "error",
        title: "Configuração em falta",
        body: "Define NEXT_PUBLIC_API_URL no frontend para ativar o registo com Google.",
      });
      return;
    }

    setIsStartingGoogle(true);
    window.location.assign(redirectUrl);
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      const response = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: normalizedEmail,
          password: form.password,
          password_confirmation: form.passwordConfirmation,
          role: "client",
        }),
      });

      const payload = await parseApiResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Não foi possível criar conta",
          body:
            payload?.errors?.email?.[0] ??
            payload?.errors?.password?.[0] ??
            payload?.message ??
            "Verifica os dados e tenta novamente.",
        });
        return;
      }

      if (payload?.token) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
      }
      if (payload?.token_type) {
        window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, payload.token_type);
      }

      setStatus({
        kind: "success",
        title: "Conta criada",
        body: "O registo foi concluído com sucesso.",
      });

      router.push(getRedirectPath(payload?.user?.role));
    } catch {
      setStatus({
        kind: "error",
        title: "Falha de ligação",
        body: "Não foi possível ligar ao serviço neste momento. Tenta novamente dentro de instantes.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MinimalAuthCard
      title="Criar conta"
      subtitle="Cria a tua conta e começa a preparar a barbearia para receber marcações online."
      alternateText="Já tens conta?"
      alternateHref="/login"
      alternateLabel="Entrar"
    >
      <MinimalSocialButton
        provider="google"
        label={isStartingGoogle ? "A abrir Google..." : "Continuar com Google"}
        onClick={handleGoogleLogin}
      />

      <MinimalDivider />

      <form className="grid gap-4" onSubmit={handleRegister}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-neutral-700">Nome</span>
          <input
            className={publicInputClass}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nome do utilizador"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-neutral-700">E-mail</span>
          <input
            className={publicInputClass}
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="utilizador@example.com"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-neutral-700">Palavra-passe</span>
          <input
            className={publicInputClass}
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Palavra-passe123!"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-neutral-700">Confirmação</span>
          <input
            className={publicInputClass}
            type="password"
            value={form.passwordConfirmation}
            onChange={(event) => setForm((current) => ({ ...current, passwordConfirmation: event.target.value }))}
            placeholder="Palavra-passe123!"
          />
        </label>

        <button type="submit" disabled={isSubmitting} className={publicPrimaryButtonClass}>
          {isSubmitting ? "A criar..." : "Criar conta"}
        </button>
      </form>

      <div className="mt-6">
        <StatusNotice kind={status.kind} title={status.title} body={status.body} />
      </div>
    </MinimalAuthCard>
  );
}
