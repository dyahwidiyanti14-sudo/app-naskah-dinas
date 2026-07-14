import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Alat Bantu Penyusunan Naskah Dinas · BPS Provinsi Jawa Tengah",
  description:
    "Susun Surat Dinas, Surat Undangan, Memorandum, Nota Dinas, dan Surat Perintah/Tugas sesuai Tata Naskah Dinas BPS Provinsi Jawa Tengah.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
