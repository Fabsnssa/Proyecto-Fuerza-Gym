"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  LineChart,
  ClipboardList,
  ShieldCheck,
  Dumbbell,
  Database,
  Code2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    href: "/dashboard",
    label: "Registrar Metrica",
    description: "Captura de datos corporales",
    icon: Activity,
  },
  {
    href: "/dashboard/progreso",
    label: "Ver Progreso",
    description: "Graficas de evolucion",
    icon: LineChart,
  },
  {
    href: "/dashboard/historial",
    label: "Historial",
    description: "Todos los registros",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/supervision",
    label: "Supervision",
    description: "Validacion de datos",
    icon: ShieldCheck,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Dumbbell className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
            Fuerza Gym
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Composicion Fisica
          </p>
        </div>
      </div>

      {/* Modulos */}
      <div className="px-4 pt-5 pb-2">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Modulos
        </p>
      </div>
      <nav className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] leading-tight",
                        isActive
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground/70"
                      )}
                    >
                      {item.description}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Tech Stack Info */}
      <div className="border-t border-border px-4 py-4">
        <div className="rounded-lg bg-muted px-3 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Stack Tecnologico
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-foreground">
                <strong>APIs:</strong> Next.js 16 Route Handlers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] text-foreground">
                <strong>BD:</strong> JSON File Storage (fs)
              </span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Puerto Ordaz, Venezuela
        </p>
      </div>
    </aside>
  )
}
