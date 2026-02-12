"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Eye,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface User {
  id: string
  nombre: string
  apellido: string
  cedula: string
  rol: string
}

interface MetricRecord {
  id: string
  usuarioId: string
  fecha: string
  peso: number
  altura: number
  imc: number
  grasaCorporal: number
  masaMuscular: number
  notas: string
  validado: boolean
  validadoPor: string | null
  creadoEn: string
  actualizadoEn: string
}

interface GlobalStats {
  totalUsuarios: number
  totalRegistros: number
  registrosValidados: number
  registrosPendientes: number
}

export default function SupervisionPage() {
  const { data: users } = useSWR<User[]>("/api/users")
  const { data: metrics } = useSWR<MetricRecord[]>("/api/metrics")
  const { data: stats } = useSWR<GlobalStats>("/api/stats")
  const [filter, setFilter] = useState<"all" | "pending" | "validated">("all")
  const [detailMetric, setDetailMetric] = useState<MetricRecord | null>(null)

  const supervisors = users?.filter((u) => u.rol === "supervisor") || []
  const activeSupervisor = supervisors[0]

  const getUserName = (id: string) => {
    const user = users?.find((u) => u.id === id)
    return user ? `${user.nombre} ${user.apellido}` : "Desconocido"
  }

  const filteredMetrics = metrics?.filter((m) => {
    if (filter === "pending") return !m.validado
    if (filter === "validated") return m.validado
    return true
  })

  async function handleValidate(metricId: string) {
    if (!activeSupervisor) {
      toast.error("No hay un supervisor activo")
      return
    }
    try {
      await fetch(`/api/metrics/${metricId}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supervisorId: activeSupervisor.id }),
      })
      toast.success("Registro validado exitosamente")
      mutate("/api/metrics")
      mutate("/api/stats")
    } catch {
      toast.error("Error al validar el registro")
    }
  }

  const statCards = [
    {
      label: "Usuarios Activos",
      value: stats?.totalUsuarios ?? 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total Registros",
      value: stats?.totalRegistros ?? 0,
      icon: FileText,
      color: "text-[hsl(200,70%,50%)]",
      bgColor: "bg-[hsl(200,70%,50%)]/10",
    },
    {
      label: "Validados",
      value: stats?.registrosValidados ?? 0,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pendientes",
      value: stats?.registrosPendientes ?? 0,
      icon: AlertTriangle,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-foreground">
            Supervision de Datos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Proceso de validacion via{" "}
            <Badge variant="secondary" className="text-[10px] font-mono">
              POST /api/metrics/:id/validate
            </Badge>
            {activeSupervisor && (
              <span>
                {" "}
                | Supervisor: {activeSupervisor.nombre}{" "}
                {activeSupervisor.apellido}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bgColor}`}
              >
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-display text-base text-card-foreground">
                Registros de Metricas
              </CardTitle>
              <CardDescription>
                {filteredMetrics?.length ?? 0} registro(s) mostrado(s) desde{" "}
                <code className="font-mono text-xs text-primary">
                  data/metrics.json
                </code>
              </CardDescription>
            </div>
            <Select
              value={filter}
              onValueChange={(v) =>
                setFilter(v as "all" | "pending" | "validated")
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los registros</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="validated">Validados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMetrics && filteredMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>IMC</TableHead>
                    <TableHead>Grasa</TableHead>
                    <TableHead>Musculo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMetrics
                    ?.sort(
                      (a, b) =>
                        new Date(b.fecha).getTime() -
                        new Date(a.fecha).getTime()
                    )
                    .map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium text-card-foreground">
                          {getUserName(m.usuarioId)}
                        </TableCell>
                        <TableCell>{m.fecha}</TableCell>
                        <TableCell>{m.peso} kg</TableCell>
                        <TableCell>{m.imc}</TableCell>
                        <TableCell>{m.grasaCorporal}%</TableCell>
                        <TableCell>{m.masaMuscular} kg</TableCell>
                        <TableCell>
                          <Badge
                            variant={m.validado ? "default" : "secondary"}
                            className={
                              m.validado
                                ? "bg-primary/20 text-primary hover:bg-primary/20"
                                : "bg-accent/20 text-accent hover:bg-accent/20"
                            }
                          >
                            {m.validado ? "Validado" : "Pendiente"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDetailMetric(m)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Ver detalle</span>
                            </Button>
                            {!m.validado && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleValidate(m.id)}
                                className="text-primary hover:text-primary"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Validar</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">
                No se encontraron registros con el filtro seleccionado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-foreground">
              Flujo de datos de Supervision
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              El supervisor revisa registros obtenidos con{" "}
              <code className="rounded bg-muted px-1 font-mono text-primary">
                GET /api/metrics
              </code>
              . Al validar, se ejecuta{" "}
              <code className="rounded bg-muted px-1 font-mono text-primary">
                POST /api/metrics/:id/validate
              </code>{" "}
              que actualiza el campo{" "}
              <code className="rounded bg-muted px-1 font-mono text-primary">
                validado: true
              </code>{" "}
              y{" "}
              <code className="rounded bg-muted px-1 font-mono text-primary">
                validadoPor: supervisorId
              </code>{" "}
              en la base de datos JSON.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailMetric}
        onOpenChange={(open) => !open && setDetailMetric(null)}
      >
        <DialogContent className="bg-card text-card-foreground sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">
              Detalle del Registro
            </DialogTitle>
            <DialogDescription>
              Informacion completa de la metrica corporal
            </DialogDescription>
          </DialogHeader>
          {detailMetric && (
            <div className="flex flex-col gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Usuario</p>
                  <p className="font-medium text-card-foreground">
                    {getUserName(detailMetric.usuarioId)}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Fecha</p>
                  <p className="font-medium text-card-foreground">
                    {detailMetric.fecha}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="font-medium text-card-foreground">
                    {detailMetric.peso} kg
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Altura</p>
                  <p className="font-medium text-card-foreground">
                    {detailMetric.altura} cm
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">IMC</p>
                  <p className="font-medium text-card-foreground">
                    {detailMetric.imc}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Grasa</p>
                  <p className="font-medium text-card-foreground">
                    {detailMetric.grasaCorporal}%
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">
                    Masa Muscular
                  </p>
                  <p className="font-medium text-card-foreground">
                    {detailMetric.masaMuscular} kg
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge
                    variant={detailMetric.validado ? "default" : "secondary"}
                    className={
                      detailMetric.validado
                        ? "mt-1 bg-primary/20 text-primary hover:bg-primary/20"
                        : "mt-1 bg-accent/20 text-accent hover:bg-accent/20"
                    }
                  >
                    {detailMetric.validado ? "Validado" : "Pendiente"}
                  </Badge>
                </div>
              </div>
              {detailMetric.notas && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="mt-1 text-sm text-card-foreground">
                    {detailMetric.notas}
                  </p>
                </div>
              )}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  Creado:{" "}
                  {new Date(detailMetric.creadoEn).toLocaleString("es-VE")}
                </span>
                <span>
                  Actualizado:{" "}
                  {new Date(detailMetric.actualizadoEn).toLocaleString("es-VE")}
                </span>
              </div>
              {!detailMetric.validado && (
                <Button
                  onClick={() => {
                    handleValidate(detailMetric.id)
                    setDetailMetric(null)
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Validar este Registro
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
