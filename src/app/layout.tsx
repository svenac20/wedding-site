import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Great_Vibes } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tina & Sven | Vjenčanje 2027",
  description: "Dobrodošli na naše vjenčanje - 1. svibnja, 2027 - Zagreb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body
        className={`${cormorant.variable} ${montserrat.variable} ${greatVibes.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
