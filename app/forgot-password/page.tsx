"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    title: "Recuperar acesso",
    body: "Introduz o teu e-mail para receberes o link de recuperação da palavra-passe.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = await parseApiResponse(response);

      if (!response.ok) {
        setStatus({
          kind: "error",
          title: "Não foi possível enviar o e-mail",
          body: payload?.message ?? payload?.errors?.email?.[0] ?? "Verifica o e-mail e tenta novamente.",
        });
        return;
      }

      setStatus({
        kind: "success",
        title: "E-mail enviado",
        body: payload?.message ?? "Se o e-mail existir, vais receber o link de recuperação.",
      });
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
      title="Recuperar Palavra-passe"
      subtitle="Enviamos um link para redefinires a palavra-passe da tua conta BarberPro."
      alternateHref="/login"
      alternateLabel="Voltar ao login"
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#E8D6B0]/70">E-mail</span>
          <input
            className={luxuryInputClass}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="utilizador@example.com"
          />
        </label>

        <button type="submit" disabled={isSubmitting} className={luxuryPrimaryButtonClass}>
          {isSubmitting ? "A enviar..." : "Enviar link de recuperação"}
        </button>
      </form>

      <div className="mt-6">
        <StatusNotice kind={status.kind} title={status.title} body={status.body} />
      </div>

      <p className="mt-6 text-sm text-white/55">
        Já recuperaste o acesso?{" "}
        <Link href="/login" className="font-medium text-[#E8D6B0] underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
