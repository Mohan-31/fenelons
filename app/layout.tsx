'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { OrderProvider } from "@/app/context/OrderContext";
import { usePathname } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${isAdmin ? 'bg-[#f8f9fa] text-gray-900' : 'bg-[#0a0a0a] text-white'}`}>
        <OrderProvider>
          {!isAdmin && <Navbar />}
          <main className={!isAdmin ? "pt-16" : ""}>
            {children}
          </main>
        </OrderProvider>
      </body>
    </html>
  );
}
