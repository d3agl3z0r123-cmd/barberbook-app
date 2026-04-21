"use client";

import Link from "next/link";
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

  return "/dashboard-day";
}

export default function EntrarPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    title: "Entra com a tua conta",
    body: "Usa o teu e-mail e a tua palavra-passe para aceder ao BarberBook.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);

  function handleGoogleLogin() {
    const redirectUrl = googleRedirectUrl();

    if (!redirectUrl) {
      setStatus({
        kind: "error",
        title: "Configuração em falta",
        body: "Define NEXT_PUBLIC_API_URL no frontend para ativar o login com Google.",
      });
      return;
    }

    setIsStartingGoogle(true);
    window.location.assign(redirectUrl);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      const response = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: form.password,
          device_name: "next-login-page",
        }),
      });

      const payload = await parseApiResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Não foi possível entrar",
          body: payload?.errors?.email?.[0] ?? payload?.message ?? "Verifica as credenciais e tenta novamente.",
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
        title: "Sessão iniciada",
        body: "Autenticação concluída com sucesso.",
      });

      router.push(getRedirectPath(payload?.user?.role));
    } catch {
      setStatus({
        kind: "error",
        title: "Falha de ligação",
        body: "Não foi possível contactar o backend Laravel.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MinimalAuthCard
      title="Entrar"
      subtitle="Acede ao teu painel BarberBook de forma simples e direta."
      alternateText="Ainda não tens conta?"
      alternateHref="/register"
      alternateLabel="Criar conta"
    >
      <MinimalSocialButton
        provider="google"
        label={isStartingGoogle ? "A abrir Google..." : "Continuar com Google"}
        onClick={handleGoogleLogin}
      />

      <MinimalDivider />

      <form className="grid gap-4" onSubmit={handleLogin}>
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

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-neutral-700 underline underline-offset-4">
            Esqueci-me da palavra-passe
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className={publicPrimaryButtonClass}>
          {isSubmitting ? "A entrar..." : "Entrar"}
        </button>
      </form>

      <div className="mt-6">
        <StatusNotice kind={status.kind} title={status.title} body={status.body} />
      </div>
    </MinimalAuthCard>
  );
}
