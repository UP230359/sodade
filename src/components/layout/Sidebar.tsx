import Link from "next/link";

const links = [
  { href: "/", label: "Check-in" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/journal", label: "Journal" },
];

export default function Sidebar() {
  return (
    <aside className="w-48 p-4 border-r">
      <ul className="flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
