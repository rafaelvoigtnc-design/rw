import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ScrollObserver from "@/components/ScrollObserver";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "RW Brinquedos - Locação de Brinquedos e Itens de Festa",
  description: "Aluguel de brinquedos infantis e itens para festas",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.className} font-sans`}>
        {children}
        <WhatsAppFloat />
        <ScrollObserver />
      </body>
    </html>
  );
}
