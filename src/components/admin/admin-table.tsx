/**
 * Component: Admin Table | Type: Server | Deps: Link, Card, ConfirmDialog
 */
import Link from "next/link";
import { PencilSimple, TrashSimple } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export type AdminColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
};

interface AdminTableProps<T> {
  columns: AdminColumn<T>[];
  items: T[];
  getEditHref: (item: T) => string;
  getDeleteMessage: (item: T) => string;
  deleteAction: (formData: FormData) => void | Promise<void>;
  deleteIdOf: (item: T) => string;
  emptyLabel: string;
}

export function AdminTable<T>({
  columns,
  items,
  getEditHref,
  getDeleteMessage,
  deleteAction,
  deleteIdOf,
  emptyLabel,
}: AdminTableProps<T>) {
  if (items.length === 0) {
    return (
      <Card className="flex items-center justify-center p-10 text-sm text-gray-500 dark:text-gray-400">
        {emptyLabel}
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full min-w-full border-collapse bg-white text-left dark:bg-gray-900">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  "px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400",
                  col.className,
                ].join(" ")}
              >
                {col.header}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={deleteIdOf(item)}
              className="border-b border-gray-100 last:border-0 dark:border-gray-800"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={["px-4 py-3 text-sm text-gray-700 dark:text-gray-300", col.className].join(" ")}
                >
                  {col.render(item)}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={getEditHref(item)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    aria-label="Edit"
                  >
                    <PencilSimple size={16} />
                  </Link>
                  <ConfirmDialog
                    message={getDeleteMessage(item)}
                    id={deleteIdOf(item)}
                    action={deleteAction}
                    trigger={
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400"
                        aria-label="Delete"
                        role="button"
                        tabIndex={0}
                      >
                        <TrashSimple size={16} />
                      </span>
                    }
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
