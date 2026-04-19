"use client";

import Link from "next/link";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthShell, luxuryInputClass, luxuryPrimaryButtonClass } from "@/components/auth-shell";
import { StatusNotice } from "@/components/app-ui";

const API_BASE_URL = "http://127.0.0.1:8000/api";

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

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const emailFromQuery = searchParams.get("email") ?? "";
  const [form, setForm] = useState({
    email: emailFromQuery,
    password: "",
    passwordConfirmation: "",
  });
  const [status, setStatus] = useState<StatusState>({
    kind: token ? "idle" : "error",
    title: token ? "Redefinir palavra-passe" : "Link inválido",
    body: token
      ? "Define uma nova palavra-passe para voltares a entrar na tua conta."
      : "Este link de recuperação não tem um token válido.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => Boolean(token && form.email), [form.email, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setStatus({
        kind: "error",
        title: "Dados em falta",
        body: "Confirma que abriste o link completo enviado por e-mail.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email: form.email,
          password: form.password,
          password_confirmation: form.passwordConfirmation,
        }),
      });

      const payload = await parseApiResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Não foi possível redefinir",
          body:
            payload?.message ??
            payload?.errors?.email?.[0] ??
            payload?.errors?.password?.[0] ??
            "Verifica os dados e tenta novamente.",
        });
        return;
      }

      setStatus({
        kind: "success",
        title: "Palavra-passe redefinida",
        body: payload?.message ?? "Já podes voltar a entrar com a nova palavra-passe.",
      });
      setForm((current) => ({ ...current, password: "", passwordConfirmation: "" }));
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
    <AuthShell
      title="Nova Palavra-passe"
      subtitle="Atualiza a palavra-passe da tua conta com o link de recuperação enviado por e-mail."
      alternateHref="/login"
      alternateLabel="Entrar"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#E8D6B0]/70">E-mail</span>
          <input
            className={luxuryInputClass}
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="utilizador@example.com"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#E8D6B0]/70">Nova palavra-passe</span>
          <input
            className={luxuryInputClass}
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password123!"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#E8D6B0]/70">Confirmação</span>
          <input
            className={luxuryInputClass}
            type="password"
            value={form.passwordConfirmation}
            onChange={(event) => setForm((current) => ({ ...current, passwordConfirmation: event.target.value }))}
            placeholder="Password123!"
          />
        </label>

        <button type="submit" disabled={isSubmitting || !canSubmit} className={luxuryPrimaryButtonClass}>
          {isSubmitting ? "A guardar..." : "Redefinir palavra-passe"}
        </button>
      </form>

      <div className="mt-6">
        <StatusNotice kind={status.kind} title={status.title} body={status.body} />
      </div>

      <p className="mt-6 text-sm text-white/55">
        Voltar ao acesso principal?{" "}
        <Link href="/login" className="font-medium text-[#E8D6B0] underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
