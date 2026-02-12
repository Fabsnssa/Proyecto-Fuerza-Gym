"use client"

import { useState } from "react"
import useSWR from "swr"
import { ProgressCharts } from "@/components/progress-charts"
import { StatsCards } from "@/components/stats-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LineChart as LineChartIcon, Info } from "lucide-react"

interface User {
  id: string
  nombre: string
  apellido: string
  rol: string
}

export default function ProgresoPage() {
  const { data: users } = useSWR<User[]>("/api/users")
  const [selectedUser, setSelectedUser] = useState("")
  const regularUsers = users?.filter((u) => u.rol === "usuario")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-foreground">
          Visualizacion de Progreso
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Proceso 2 del DFD: Graficas de evolucion generadas con datos de{" "}
          <Badge variant="secondary" className="text-[10px] font-mono">
            GET /api/metrics?usuarioId=...
          </Badge>{" "}
          y{" "}
          <Badge variant="secondary" className="text-[10px] font-mono">
            GET /api/stats?usuarioId=...
          </Badge>
        </p>
      </div>

      {/* User Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base text-card-foreground">
            Seleccionar Usuario
          </CardTitle>
          <CardDescription>
            Elige un usuario para ver su evolucion grafica a lo largo del tiempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue placeholder="Seleccionar usuario..." />
            </SelectTrigger>
            <SelectContent>
              {regularUsers?.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nombre} {u.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedUser ? (
        <>
          <StatsCards usuarioId={selectedUser} />
          <ProgressCharts usuarioId={selectedUser} />

          {/* API Info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-foreground">
                  Flujo de datos de Progreso
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Los graficos se alimentan de{" "}
                  <code className="rounded bg-muted px-1 font-mono text-primary">
                    GET /api/metrics?usuarioId=X
                  </code>{" "}
                  que lee{" "}
                  <code className="rounded bg-muted px-1 font-mono text-primary">
                    data/metrics.json
                  </code>
                  , filtra por usuario y ordena por fecha. Las tarjetas de
                  resumen se generan con{" "}
                  <code className="rounded bg-muted px-1 font-mono text-primary">
                    GET /api/stats?usuarioId=X
                  </code>
                  . Recharts procesa la data y renderiza las visualizaciones.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16">
            <LineChartIcon className="h-16 w-16 text-muted-foreground/20" />
            <div className="text-center">
              <p className="text-lg font-medium text-card-foreground">
                Selecciona un usuario
              </p>
              <p className="text-sm text-muted-foreground">
                Los graficos de progreso se mostraran aqui
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
