/**
 * Layout: Admin | Type: Server | Deps: requireAuth
 */
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { LogOut } from "@/components/admin/logout-button";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAuth();

  return (
    <div className="flex min-h-[100dvh]">
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:block">
        <div className="flex h-full flex-col justify-between p-4">
          <nav className="flex flex-col gap-1">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-gray-400">
              Admin
            </p>
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/projects"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Projects
            </Link>
            <Link
              href="/admin/experience"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Experience
            </Link>
            <Link
              href="/admin/stack"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Stack
            </Link>
            <Link
              href="/admin/certifications"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Certifications
            </Link>
            <Link
              href="/admin/resources"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Resources
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Settings
            </Link>
          </nav>
          <LogOut />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 md:hidden">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            Admin
          </span>
          <LogOut />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
