"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";
import { ToolList } from "@/utils";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link legacyBehavior href={href} passHref>
      <a className={isActive(href) ? styles.active : ""}>{children}</a>
    </Link>
  );

  return (
    <nav className={styles.nav}>
      <NavLink href="/">首页</NavLink>
      {ToolList.map((tool, index) => (
        <NavLink key={index} href={tool.link}>
          {tool.name}
        </NavLink>
      ))}
    </nav>
  );
}
