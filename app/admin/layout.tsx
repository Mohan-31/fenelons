// app/admin/layout.tsx (Recommended location)
// OR app/admin/orders/[meatType]/layout.tsx

import { AuthProvider } from "@/app/components/Providers"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {/* This wraps your Production Page so useSession() works */}
      {children}
    </AuthProvider>
  )
}