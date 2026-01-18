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
  // Check if we are in the admin section
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}>
        <OrderProvider>
          {/* ONLY show the main navbar if NOT in admin */}
          {!isAdmin && <Navbar />}

          <main className={!isAdmin ? "pt-16" : ""}>
            {children}
          </main>
        </OrderProvider>
      </body>
    </html>
  );
}