import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/auth?callbackUrl=/admin");
  }
  if (!isAdminEmail(email)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6">
        <div className="vp-card rounded-3xl p-8 max-w-md text-center">
          <p className="text-2xl font-extrabold mb-2">Acesso restrito</p>
          <p className="text-sm text-white/65 mb-4">
            Esta área é só pra administradores. Sua conta ({email}) não tem permissão.
          </p>
          <a href="/" className="block py-2 rounded-xl bg-white/10 text-sm font-medium">
            Voltar ao app
          </a>
        </div>
      </div>
    );
  }

  return <AdminShell email={email}>{children}</AdminShell>;
}
