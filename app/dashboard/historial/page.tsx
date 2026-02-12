"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  ClipboardList,
  Pencil,
  Trash2,
  Search,
  Info,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface User {
  id: string
  nombre: string
  apellido: string
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
  creadoEn: string
  actualizadoEn: string
}

function getIMCCategory(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Bajo peso", color: "text-[hsl(200,70%,50%)]" }
  if (imc < 25) return { label: "Normal", color: "text-primary" }
  if (imc < 30) return { label: "Sobrepeso", color: "text-accent" }
  return { label: "Obesidad", color: "text-destructive" }
}

export default function HistorialPage() {
  const { data: users } = useSWR<User[]>("/api/users")
  const { data: allMetrics } = useSWR<MetricRecord[]>("/api/metrics")

  const [filterUser, setFilterUser] = useState("all")
  const [searchDate, setSearchDate] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingMetric, setEditingMetric] = useState<MetricRecord | null>(null)
  const [editForm, setEditForm] = useState({
    peso: "",
    altura: "",
    grasaCorporal: "",
    masaMuscular: "",
    notas: "",
  })

  const regularUsers = users?.filter((u) => u.rol === "usuario")

  const getUserName = (id: string) => {
    const user = users?.find((u) => u.id === id)
    return user ? `${user.nombre} ${user.apellido}` : "Desconocido"
  }

  const filteredMetrics = allMetrics
    ?.filter((m) => {
      if (filterUser !== "all" && m.usuarioId !== filterUser) return false
      if (searchDate && !m.fecha.includes(searchDate)) return false
      return true
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  function openEdit(m: MetricRecord) {
    setEditingMetric(m)
    setEditForm({
      peso: String(m.peso),
      altura: String(m.altura),
      grasaCorporal: String(m.grasaCorporal),
      masaMuscular: String(m.masaMuscular),
      notas: m.notas,
    })
    setEditDialogOpen(true)
  }

  async function handleEditSubmit() {
    if (!editingMetric) return
    try {
      const res = await fetch(`/api/metrics/${editingMetric.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          peso: Number(editForm.peso),
          altura: Number(editForm.altura),
          grasaCorporal: Number(editForm.grasaCorporal),
          masaMuscular: Number(editForm.masaMuscular),
          notas: editForm.notas,
        }),
      })
      if (!res.ok) {
        toast.error("Error al actualizar el registro")
        return
      }
      toast.success("Registro actualizado correctamente")
      setEditDialogOpen(false)
      setEditingMetric(null)
      mutate("/api/metrics")
      mutate("/api/stats")
    } catch {
      toast.error("Error de conexion")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Estas seguro de eliminar este registro?")) return
    try {
      await fetch(`/api/metrics/${id}`, { method: "DELETE" })
      toast.success("Registro eliminado")
      mutate("/api/metrics")
      mutate("/api/stats")
    } catch {
      toast.error("Error al eliminar")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-foreground">
          Historial de Registros
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta, edicion y eliminacion de registros almacenados via{" "}
          <Badge variant="secondary" className="text-[10px] font-mono">
            GET /api/metrics
          </Badge>{" "}
          <Badge variant="secondary" className="text-[10px] font-mono">
            PUT /api/metrics/:id
          </Badge>{" "}
          <Badge variant="secondary" className="text-[10px] font-mono">
            DELETE /api/metrics/:id
          </Badge>
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base text-card-foreground">
            <Filter className="h-4 w-4 text-primary" />
            Filtros de Busqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2 sm:w-64">
              <Label>Usuario</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {regularUsers?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre} {u.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:w-48">
              <Label>Filtrar por fecha</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="2026-01"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">
                {filteredMetrics?.length ?? 0} registros
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base text-card-foreground">
            <ClipboardList className="h-4 w-4 text-primary" />
            Registros del Sistema
          </CardTitle>
          <CardDescription>
            Datos almacenados en{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs text-primary">
              data/metrics.json
            </code>{" "}
            leidos por el API
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMetrics && filteredMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Peso (kg)</TableHead>
                    <TableHead>Altura (cm)</TableHead>
                    <TableHead>IMC</TableHead>
                    <TableHead>Grasa (%)</TableHead>
                    <TableHead>Musculo (kg)</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMetrics.map((m) => {
                    const imcCat = getIMCCategory(m.imc)
                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium text-card-foreground">
                          {getUserName(m.usuarioId)}
                        </TableCell>
                        <TableCell className="text-card-foreground">
                          {m.fecha}
                        </TableCell>
                        <TableCell>{m.peso}</TableCell>
                        <TableCell>{m.altura}</TableCell>
                        <TableCell>
                          <span className={`font-semibold ${imcCat.color}`}>
                            {m.imc}
                          </span>
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            ({imcCat.label})
                          </span>
                        </TableCell>
                        <TableCell>{m.grasaCorporal}%</TableCell>
                        <TableCell>{m.masaMuscular}</TableCell>
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
                              onClick={() => openEdit(m)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(m.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">
                No se encontraron registros con los filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Flow Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-foreground">
              Flujo de datos del Historial
            </p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              <code className="rounded bg-muted px-1 font-mono text-primary">
                GET /api/metrics
              </code>{" "}
              lee los registros de{" "}
              <code className="rounded bg-muted px-1 font-mono text-primary">
                data/metrics.json
              </code>
              . Las operaciones de edicion (
              <code className="rounded bg-muted px-1 font-mono text-primary">
                PUT
              </code>
              ) y eliminacion (
              <code className="rounded bg-muted px-1 font-mono text-primary">
                DELETE
              </code>
              ) actualizan el mismo archivo mediante los API Route Handlers de
              Next.js 16.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card text-card-foreground sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Registro</DialogTitle>
            <DialogDescription>
              Los cambios se guardan via{" "}
              <code className="font-mono text-primary">
                PUT /api/metrics/:id
              </code>
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label>Peso (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={editForm.peso}
                onChange={(e) =>
                  setEditForm({ ...editForm, peso: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Altura (cm)</Label>
              <Input
                type="number"
                step="0.1"
                value={editForm.altura}
                onChange={(e) =>
                  setEditForm({ ...editForm, altura: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Grasa Corporal (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={editForm.grasaCorporal}
                onChange={(e) =>
                  setEditForm({ ...editForm, grasaCorporal: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Masa Muscular (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={editForm.masaMuscular}
                onChange={(e) =>
                  setEditForm({ ...editForm, masaMuscular: e.target.value })
                }
              />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label>Notas</Label>
              <Textarea
                value={editForm.notas}
                onChange={(e) =>
                  setEditForm({ ...editForm, notas: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="bg-transparent">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleEditSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
