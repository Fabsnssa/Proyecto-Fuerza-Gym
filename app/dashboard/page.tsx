"use client"

import React, { useState, useMemo } from "react"
import useSWR, { mutate } from "swr"
import {
  Save,
  Calculator,
  Info,
  UserPlus,
  X,
  ChevronDown,
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface User {
  id: string
  nombre: string
  apellido: string
  rol: string
}

function getIMCCategory(imc: number): { label: string; colorClass: string } {
  if (imc < 18.5)
    return { label: "Bajo peso", colorClass: "text-[hsl(200,70%,50%)]" }
  if (imc < 25) return { label: "Normal", colorClass: "text-primary" }
  if (imc < 30) return { label: "Sobrepeso", colorClass: "text-accent" }
  return { label: "Obesidad", colorClass: "text-destructive" }
}

const emptyMetricForm = {
  usuarioId: "",
  fecha: new Date().toISOString().split("T")[0],
  peso: "",
  altura: "",
  grasaCorporal: "",
  masaMuscular: "",
  notas: "",
}

const emptyUserForm = {
  nombre: "",
  apellido: "",
  cedula: "",
  edad: "",
  sexo: "" as "" | "M" | "F",
  email: "",
}

export default function RegistrarMetricaPage() {
  const { data: users } = useSWR<User[]>("/api/users")
  const [form, setForm] = useState(emptyMetricForm)
  const [submitting, setSubmitting] = useState(false)

  // New user form state
  const [showNewUser, setShowNewUser] = useState(false)
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [creatingUser, setCreatingUser] = useState(false)

  const regularUsers = users?.filter((u) => u.rol === "usuario") ?? []

  const previewIMC = useMemo(() => {
    const peso = Number(form.peso)
    const altura = Number(form.altura)
    if (peso > 0 && altura > 0) {
      const alturaM = altura / 100
      return Math.round((peso / (alturaM * alturaM)) * 100) / 100
    }
    return null
  }, [form.peso, form.altura])

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreatingUser(true)
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userForm,
          edad: Number(userForm.edad),
          rol: "usuario",
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Error al crear el usuario")
        return
      }
      const newUser = await res.json()
      toast.success(
        `Usuario ${newUser.nombre} ${newUser.apellido} creado exitosamente`
      )
      setUserForm(emptyUserForm)
      setShowNewUser(false)
      await mutate("/api/users")
      // Auto-select the new user
      setForm((prev) => ({ ...prev, usuarioId: newUser.id }))
    } catch {
      toast.error("Error de conexion al crear usuario")
    } finally {
      setCreatingUser(false)
    }
  }

  async function handleSubmitMetric(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          peso: Number(form.peso),
          altura: Number(form.altura),
          grasaCorporal: Number(form.grasaCorporal),
          masaMuscular: Number(form.masaMuscular),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Error al registrar la metrica")
        return
      }
      toast.success("Metrica corporal registrada exitosamente")
      setForm(emptyMetricForm)
      mutate("/api/metrics")
      mutate("/api/stats")
    } catch {
      toast.error("Error de conexion al registrar")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedUser = regularUsers.find((u) => u.id === form.usuarioId)

  const isUserFormValid =
    userForm.nombre.trim() &&
    userForm.apellido.trim() &&
    userForm.cedula.trim() &&
    userForm.edad &&
    Number(userForm.edad) > 0 &&
    userForm.sexo &&
    userForm.email.trim()

  const isMetricFormValid =
    form.usuarioId &&
    form.fecha &&
    form.peso &&
    Number(form.peso) > 0 &&
    form.altura &&
    Number(form.altura) > 0 &&
    form.grasaCorporal &&
    form.masaMuscular

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-balance text-foreground">
          Registrar Metrica Corporal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Captura de metricas, calculo automatico del IMC y almacenamiento via{" "}
          <Badge variant="secondary" className="text-[10px] font-mono">
            POST /api/metrics
          </Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main Form Column */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* New User Section */}
          <Card
            className={
              showNewUser ? "border-primary/40 bg-primary/5" : undefined
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="font-display text-base text-card-foreground">
                  1. Seleccionar o Crear Usuario
                </CardTitle>
                <CardDescription>
                  {regularUsers.length === 0
                    ? "No hay usuarios registrados. Crea uno para continuar."
                    : "Selecciona un usuario existente o crea uno nuevo."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {/* User Selector + New User Toggle */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="usuario">Usuario</Label>
                  <Select
                    value={form.usuarioId}
                    onValueChange={(v) => setForm({ ...form, usuarioId: v })}
                  >
                    <SelectTrigger id="usuario" className="w-full">
                      <SelectValue
                        placeholder={
                          regularUsers.length === 0
                            ? "-- Sin usuarios --"
                            : "Seleccionar usuario"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {regularUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nombre} {u.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant={showNewUser ? "secondary" : "outline"}
                  className={
                    showNewUser
                      ? "shrink-0 bg-secondary text-secondary-foreground"
                      : "shrink-0 border-primary/30 bg-transparent text-primary hover:bg-primary/10"
                  }
                  onClick={() => setShowNewUser(!showNewUser)}
                >
                  {showNewUser ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Nuevo Usuario
                    </>
                  )}
                </Button>
              </div>

              {/* Inline New User Form */}
              {showNewUser && (
                <form
                  onSubmit={handleCreateUser}
                  className="flex flex-col gap-4 rounded-lg border border-primary/20 bg-card p-4"
                >
                  <p className="text-sm font-medium text-foreground">
                    Datos del nuevo usuario
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="u-nombre">Nombre</Label>
                      <Input
                        id="u-nombre"
                        value={userForm.nombre}
                        onChange={(e) =>
                          setUserForm({ ...userForm, nombre: e.target.value })
                        }
                        placeholder="Orangel"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="u-apellido">Apellido</Label>
                      <Input
                        id="u-apellido"
                        value={userForm.apellido}
                        onChange={(e) =>
                          setUserForm({ ...userForm, apellido: e.target.value })
                        }
                        placeholder="Rodriguez"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="u-cedula">Cedula</Label>
                      <Input
                        id="u-cedula"
                        value={userForm.cedula}
                        onChange={(e) =>
                          setUserForm({ ...userForm, cedula: e.target.value })
                        }
                        placeholder="V-12345678"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="u-edad">Edad</Label>
                      <Input
                        id="u-edad"
                        type="number"
                        min="10"
                        max="100"
                        value={userForm.edad}
                        onChange={(e) =>
                          setUserForm({ ...userForm, edad: e.target.value })
                        }
                        placeholder="25"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="u-sexo">Sexo</Label>
                      <Select
                        value={userForm.sexo}
                        onValueChange={(v: "M" | "F") =>
                          setUserForm({ ...userForm, sexo: v })
                        }
                      >
                        <SelectTrigger id="u-sexo">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="u-email">Email</Label>
                      <Input
                        id="u-email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) =>
                          setUserForm({ ...userForm, email: e.target.value })
                        }
                        placeholder="correo@email.com"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={!isUserFormValid || creatingUser}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {creatingUser ? "Creando..." : "Crear Usuario"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Metric Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base text-card-foreground">
                2. Datos de la Medicion
              </CardTitle>
              <CardDescription>
                Los datos se envian al API Route{" "}
                <code className="rounded bg-muted px-1 font-mono text-[11px] text-primary">
                  POST /api/metrics
                </code>{" "}
                y se almacenan en la base de datos JSON del servidor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmitMetric}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fecha">Fecha de Medicion</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={form.fecha}
                      onChange={(e) =>
                        setForm({ ...form, fecha: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      type="number"
                      step="0.1"
                      min="20"
                      max="300"
                      value={form.peso}
                      onChange={(e) =>
                        setForm({ ...form, peso: e.target.value })
                      }
                      placeholder="75.5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="altura">Altura (cm)</Label>
                    <Input
                      id="altura"
                      type="number"
                      step="0.1"
                      min="100"
                      max="250"
                      value={form.altura}
                      onChange={(e) =>
                        setForm({ ...form, altura: e.target.value })
                      }
                      placeholder="175"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="grasa">Grasa Corporal (%)</Label>
                    <Input
                      id="grasa"
                      type="number"
                      step="0.1"
                      min="3"
                      max="60"
                      value={form.grasaCorporal}
                      onChange={(e) =>
                        setForm({ ...form, grasaCorporal: e.target.value })
                      }
                      placeholder="20.5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="musculo">Masa Muscular (kg)</Label>
                    <Input
                      id="musculo"
                      type="number"
                      step="0.1"
                      min="10"
                      max="120"
                      value={form.masaMuscular}
                      onChange={(e) =>
                        setForm({ ...form, masaMuscular: e.target.value })
                      }
                      placeholder="35.0"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notas">Notas / Observaciones</Label>
                  <Textarea
                    id="notas"
                    value={form.notas}
                    onChange={(e) =>
                      setForm({ ...form, notas: e.target.value })
                    }
                    placeholder="Observaciones adicionales del entrenador o usuario..."
                    rows={3}
                  />
                </div>

                {selectedUser && (
                  <p className="text-sm text-muted-foreground">
                    Registrando para:{" "}
                    <span className="font-medium text-foreground">
                      {selectedUser.nombre} {selectedUser.apellido}
                    </span>
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                  disabled={!isMetricFormValid || submitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {submitting ? "Guardando..." : "Registrar Metrica"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: IMC Preview + Info */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base text-card-foreground">
                <Calculator className="h-4 w-4 text-primary" />
                Calculo IMC en Tiempo Real
              </CardTitle>
              <CardDescription>
                Se calcula automaticamente al ingresar peso y altura
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {previewIMC ? (
                <>
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary/30 bg-primary/10">
                    <span className="text-3xl font-bold text-primary">
                      {previewIMC}
                    </span>
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-lg font-semibold ${getIMCCategory(previewIMC).colorClass}`}
                    >
                      {getIMCCategory(previewIMC).label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Indice de Masa Corporal
                    </p>
                    {selectedUser && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Para: {selectedUser.nombre} {selectedUser.apellido}
                      </p>
                    )}
                  </div>
                  <div className="w-full rounded-lg bg-muted p-3">
                    <p className="text-xs text-muted-foreground">
                      {"< 18.5: Bajo peso"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {"18.5 - 24.9: Normal"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {"25 - 29.9: Sobrepeso"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {">= 30: Obesidad"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Calculator className="h-12 w-12 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">
                    Ingresa peso y altura para ver la previsualizacion
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Info Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-start gap-3 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-foreground">
                  Flujo de datos
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Formulario {"->"}
                  <code className="rounded bg-muted px-1 font-mono text-primary">
                    POST /api/metrics
                  </code>{" "}
                  {"->"}
                  Validacion en servidor {"->"}
                  Calculo IMC {"->"}
                  Almacenamiento en{" "}
                  <code className="rounded bg-muted px-1 font-mono text-primary">
                    data/metrics.json
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Users Info Card */}
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="flex items-start gap-3 p-4">
              <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-foreground">
                  Registro de usuarios
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Nuevo usuario {"->"}
                  <code className="rounded bg-muted px-1 font-mono text-accent">
                    POST /api/users
                  </code>{" "}
                  {"->"}
                  Almacenamiento en{" "}
                  <code className="rounded bg-muted px-1 font-mono text-accent">
                    data/users.json
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
