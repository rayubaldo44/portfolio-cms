/**
 * Page: Admin Dashboard | Type: Server | Deps: db
 */
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [projects, experience, skills, certifications] = await Promise.all([
    db.project.count(),
    db.experience.count(),
    db.skill.count(),
    db.certification.count(),
  ]);

  const stats = [
    { label: "Projects", count: projects, href: "/admin/projects" },
    { label: "Experience", count: experience, href: "/admin/experience" },
    { label: "Skills", count: skills, href: "/admin/stack" },
    { label: "Certifications", count: certifications, href: "/admin/certifications" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your portfolio content.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="transition-colors group-hover:border-gray-400 dark:group-hover:border-gray-600">
              <CardHeader>
                <CardTitle className="text-3xl font-bold">
                  {stat.count}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
