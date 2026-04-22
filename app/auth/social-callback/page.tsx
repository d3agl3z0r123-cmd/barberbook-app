"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { StatusNotice } from "@/components/app-ui";
import { MinimalAuthCard, publicPrimaryButtonClass, publicSecondaryButtonClass } from "@/components/public-ui";

const TOKEN_STORAGE_KEY = "token";
const TOKEN_TYPE_STORAGE_KEY = "token_type";

function getRedirectPath(role?: string | null, isNewUser?: boolean) {
  if (isNewUser) {
    return "/onboarding/client";
  }

  if (role === "barber" || role === "owner") {
    return "/backoffice";
  }

  return "/backoffice";
}

function SocialCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("A concluir autenticação social...");
  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      setMessage(error);
      return;
    }

    const token = searchParams.get("token");
    const tokenType = searchParams.get("token_type") ?? "Bearer";
    const role = searchParams.get("role");
    const isNewUser = searchParams.get("is_new_user") === "1";

    if (!token) {
      setMessage("Não foi recebido nenhum token de autenticação. Tenta novamente.");
      return;
    }

    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    window.localStorage.setItem(TOKEN_TYPE_STORAGE_KEY, tokenType);
    router.replace(getRedirectPath(role, isNewUser));
  }, [error, router, searchParams]);

  return (
    <MinimalAuthCard
      title={error ? "Não foi possível entrar" : "Sessão iniciada"}
      subtitle={error ? "Revê a configuração OAuth ou tenta outro método de entrada." : "Estamos a preparar o teu painel BarberBook."}
      alternateText="Preferes usar e-mail?"
      alternateHref="/login"
      alternateLabel="Entrar com e-mail"
    >
      <StatusNotice
        kind={error ? "error" : "success"}
        title={error ? "Erro no login social" : "Autenticação concluída"}
        body={message}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/login" className={publicSecondaryButtonClass}>
          Voltar ao login
        </Link>
        <Link href="/register" className={publicPrimaryButtonClass}>
          Criar conta
        </Link>
      </div>
    </MinimalAuthCard>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={null}>
      <SocialCallbackContent />
    </Suspense>
  );
}
