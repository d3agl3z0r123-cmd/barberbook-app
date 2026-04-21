import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const appFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-app",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "BarberBook | SaaS para Barbearias",
  description:
    "Gestão de agenda, clientes, barbeiros e marcações online num SaaS moderno para barbearias.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body className={`${appFont.variable} bg-canvas text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
