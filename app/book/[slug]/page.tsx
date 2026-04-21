import Link from "next/link";
import { PublicBookingFlow } from "@/components/public-booking-flow";
import { BookingHeader, PublicPageShell, publicPrimaryButtonClass } from "@/components/public-ui";
import { getBookingSummary } from "@/lib/api";

type BookingPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BookingPage({ params }: BookingPageProps) {
  const { slug } = await params;
  const bookingSummary = await getBookingSummary(slug);
  const avatarLabel =
    bookingSummary?.name
      ?.split(" ")
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "BB";

  if (!bookingSummary) {
    return (
      <PublicPageShell>
        <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center py-8">
          <section className="w-full rounded-[32px] border border-neutral-200 bg-white p-8 shadow-sm md:p-10">
            <p className="text-sm font-semibold tracking-tight text-neutral-500">Marcação pública</p>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-neutral-950">Barbearia não encontrada</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-500">
              O link que abriste não corresponde a uma barbearia ativa ou já não está disponível.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/" className={publicPrimaryButtonClass}>
                Voltar para o site
              </Link>
            </div>
          </section>
        </div>
      </PublicPageShell>
    );
  }

  return (
    <PublicPageShell
      topLink={
        <Link href="/" className="text-sm font-medium text-neutral-500 transition-all hover:text-neutral-900">
          Voltar ao site
        </Link>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10">
        <BookingHeader
          name={bookingSummary.name}
          subtitle={bookingSummary.tagline}
          avatarLabel={avatarLabel}
          imageUrl={bookingSummary.backgroundImageUrl ?? bookingSummary.imageUrl}
          logoUrl={bookingSummary.logoUrl}
          instagramUrl={bookingSummary.instagramUrl}
          facebookUrl={bookingSummary.facebookUrl}
          badges={[
            `${bookingSummary.city} · ${bookingSummary.neighborhood}`,
            `${bookingSummary.averageRating} estrelas`,
            bookingSummary.bookingFeeNote,
          ]}
        />

        <PublicBookingFlow
          slug={bookingSummary.slug}
          timezone={bookingSummary.timezone}
          source={bookingSummary.source}
          barbers={bookingSummary.barbers}
          services={bookingSummary.services}
        />
      </div>
    </PublicPageShell>
  );
}
