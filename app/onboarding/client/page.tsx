"use client";

import Link from "next/link";
import { MinimalAuthCard, publicPrimaryButtonClass, publicSecondaryButtonClass } from "@/components/public-ui";
import { StatusNotice } from "@/components/app-ui";

export default function ClientOnboardingPage() {
  return (
    <MinimalAuthCard
      title="Conta criada com Google"
      subtitle="A tua conta BarberBook já está ativa. O próximo passo é escolher uma barbearia e fazer a tua primeira marcação."
      alternateText="Já sabes onde queres marcar?"
      alternateHref="/"
      alternateLabel="Ver barbearias"
    >
      <StatusNotice
        kind="success"
        title="Autenticação concluída"
        body="Guardámos a tua sessão com segurança. Podes continuar para procurar uma barbearia ou voltar à página inicial."
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link href="/" className={publicPrimaryButtonClass}>
          Procurar barbearia
        </Link>
        <Link href="/dashboard-day" className={publicSecondaryButtonClass}>
          Ir para a minha área
        </Link>
      </div>
    </MinimalAuthCard>
  );
}
