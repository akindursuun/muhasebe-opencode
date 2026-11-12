import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "HotelFinance | Otel Finans Yönetimi", description: "İki şubeli otel işletmeleri için finans ve idari yönetim sistemi." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}