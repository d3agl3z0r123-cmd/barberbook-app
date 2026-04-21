"use client";

type BookingErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BookingErrorPage({ error, reset }: BookingErrorPageProps) {
  return (
    <main className="section-shell py-8">
      <section className="card p-8 md:p-10">
        <p className="text-sm uppercase tracking-[0.22em] text-black/45">Marcação pública</p>
        <h1 className="mt-3 text-4xl">Não foi possível abrir esta página</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/65">
          Ocorreu um erro ao carregar a barbearia ou os dados públicos de marcação.
        </p>
        {error.message ? (
          <p className="mt-3 text-sm leading-7 text-black/55">Detalhe: {error.message}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-[#1d1712] px-6 py-3 text-sm font-semibold text-white"
          >
            Tentar novamente
          </button>
        </div>
      </section>
    </main>
  );
}
