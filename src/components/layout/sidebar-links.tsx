/**
 * Section: Layout | Type: Client | Deps: cn, Link
 */
"use client";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface SidebarLinkItem {
  href: string;
  label: string;
  icon: Icon;
}

interface SidebarLinksProps {
  items: readonly SidebarLinkItem[];
  activePath: string;
  onNavigate?: () => void;
}

const ITEM_BASE =
  "type-ui flex items-center gap-2.5 rounded-md px-3 py-2.5 transition-colors";

export function SidebarLinks({ items, activePath, onNavigate }: SidebarLinksProps) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
        const ItemIcon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              ITEM_BASE,
              isActive
                ? "text-gray-900 dark:text-gray-50"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
            )}
          >
            {isActive && <ArrowRight aria-hidden="true" size={13} weight="regular" className="shrink-0" />}
            <ItemIcon aria-hidden="true" size={16} weight="regular" className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
