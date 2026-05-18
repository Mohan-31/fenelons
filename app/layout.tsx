'use client'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { OrderProvider } from "@/app/context/OrderContext";
import { ThemeProvider } from "@/app/context/ThemeContext";
import { usePathname } from "next/navigation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${isAdmin ? 'bg-white text-gray-900' : 'bg-white text-gray-900 dark:bg-[#0a0a0a] dark:text-white'}`}>
        <ThemeProvider>
          <OrderProvider>
            {!isAdmin && <Navbar />}
            <main className={!isAdmin ? "pt-16" : ""}>
              {children}
            </main>
          </OrderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
