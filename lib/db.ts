import fs from "fs"
import path from "path"

const DB_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DB_DIR, "users.json")
const METRICS_FILE = path.join(DB_DIR, "metrics.json")

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }
}

function readJSON<T>(filePath: string, fallback: T): T {
  ensureDir()
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2))
    return fallback
  }
  const raw = fs.readFileSync(filePath, "utf-8")
  return JSON.parse(raw) as T
}

function writeJSON<T>(filePath: string, data: T) {
  ensureDir()
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// --- Types ---
export interface User {
  id: string
  nombre: string
  apellido: string
  cedula: string
  edad: number
  sexo: "M" | "F"
  email: string
  rol: "usuario" | "supervisor"
  creadoEn: string
}

export interface MetricRecord {
  id: string
  usuarioId: string
  fecha: string
  peso: number         // kg
  altura: number       // cm
  imc: number          // auto-calculated
  grasaCorporal: number // %
  masaMuscular: number  // kg
  notas: string
  validado: boolean
  validadoPor: string | null
  creadoEn: string
  actualizadoEn: string
}

// --- User CRUD ---
export function getUsers(): User[] {
  return readJSON<User[]>(USERS_FILE, [])
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id)
}

export function createUser(data: Omit<User, "id" | "creadoEn">): User {
  const users = getUsers()
  const newUser: User = {
    ...data,
    id: crypto.randomUUID(),
    creadoEn: new Date().toISOString(),
  }
  users.push(newUser)
  writeJSON(USERS_FILE, users)
  return newUser
}

export function updateUser(id: string, data: Partial<Omit<User, "id" | "creadoEn">>): User | null {
  const users = getUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return null
  users[idx] = { ...users[idx], ...data }
  writeJSON(USERS_FILE, users)
  return users[idx]
}

export function deleteUser(id: string): boolean {
  const users = getUsers()
  const filtered = users.filter((u) => u.id !== id)
  if (filtered.length === users.length) return false
  writeJSON(USERS_FILE, filtered)
  // Also delete related metrics
  const metrics = getMetrics().filter((m) => m.usuarioId !== id)
  writeJSON(METRICS_FILE, metrics)
  return true
}

// --- Metric CRUD ---
export function getMetrics(): MetricRecord[] {
  return readJSON<MetricRecord[]>(METRICS_FILE, [])
}

export function getMetricsByUser(usuarioId: string): MetricRecord[] {
  return getMetrics()
    .filter((m) => m.usuarioId === usuarioId)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
}

export function getMetricById(id: string): MetricRecord | undefined {
  return getMetrics().find((m) => m.id === id)
}

export function calculateIMC(peso: number, alturaCm: number): number {
  const alturaM = alturaCm / 100
  if (alturaM <= 0) return 0
  return Math.round((peso / (alturaM * alturaM)) * 100) / 100
}

export function createMetric(
  data: Omit<MetricRecord, "id" | "imc" | "validado" | "validadoPor" | "creadoEn" | "actualizadoEn">
): MetricRecord {
  const metrics = getMetrics()
  const now = new Date().toISOString()
  const newMetric: MetricRecord = {
    ...data,
    id: crypto.randomUUID(),
    imc: calculateIMC(data.peso, data.altura),
    validado: false,
    validadoPor: null,
    creadoEn: now,
    actualizadoEn: now,
  }
  metrics.push(newMetric)
  writeJSON(METRICS_FILE, metrics)
  return newMetric
}

export function updateMetric(
  id: string,
  data: Partial<Omit<MetricRecord, "id" | "creadoEn">>
): MetricRecord | null {
  const metrics = getMetrics()
  const idx = metrics.findIndex((m) => m.id === id)
  if (idx === -1) return null
  const updated = { ...metrics[idx], ...data, actualizadoEn: new Date().toISOString() }
  if (data.peso !== undefined || data.altura !== undefined) {
    updated.imc = calculateIMC(
      data.peso ?? metrics[idx].peso,
      data.altura ?? metrics[idx].altura
    )
  }
  metrics[idx] = updated
  writeJSON(METRICS_FILE, metrics)
  return metrics[idx]
}

export function deleteMetric(id: string): boolean {
  const metrics = getMetrics()
  const filtered = metrics.filter((m) => m.id !== id)
  if (filtered.length === metrics.length) return false
  writeJSON(METRICS_FILE, filtered)
  return true
}

export function validateMetric(metricId: string, supervisorId: string): MetricRecord | null {
  return updateMetric(metricId, { validado: true, validadoPor: supervisorId })
}

// --- Stats / Reports ---
export function getStatsForUser(usuarioId: string) {
  const records = getMetricsByUser(usuarioId)
  if (records.length === 0) return null
  const latest = records[records.length - 1]
  const first = records[0]
  return {
    totalRegistros: records.length,
    ultimoRegistro: latest,
    primerRegistro: first,
    cambioPeso: Math.round((latest.peso - first.peso) * 100) / 100,
    cambioIMC: Math.round((latest.imc - first.imc) * 100) / 100,
    cambioGrasa: Math.round((latest.grasaCorporal - first.grasaCorporal) * 100) / 100,
    cambioMusculo: Math.round((latest.masaMuscular - first.masaMuscular) * 100) / 100,
  }
}

export function getGlobalStats() {
  const users = getUsers().filter((u) => u.rol === "usuario")
  const metrics = getMetrics()
  const validated = metrics.filter((m) => m.validado)
  const pending = metrics.filter((m) => !m.validado)
  return {
    totalUsuarios: users.length,
    totalRegistros: metrics.length,
    registrosValidados: validated.length,
    registrosPendientes: pending.length,
  }
}


