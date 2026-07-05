import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminPanel } from "@/components/AdminPanel";
import { isAdminEnabled } from "@/lib/auth";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdminEnabled()) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6">
          <p className="text-zinc-500">Admin 未启用，请设置 ADMIN_PASSWORD 环境变量。</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          管理后台
        </h1>
        <AdminPanel />
      </main>
      <Footer />
    </>
  );
}
