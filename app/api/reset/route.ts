import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DB_DIR = path.join(process.cwd(), "data")
const USERS_FILE = path.join(DB_DIR, "users.json")
const METRICS_FILE = path.join(DB_DIR, "metrics.json")

// POST /api/reset — wipe all data so the DB starts empty
export async function POST() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true })
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2))
    fs.writeFileSync(METRICS_FILE, JSON.stringify([], null, 2))
    return NextResponse.json({ ok: true, message: "Base de datos limpiada exitosamente" })
  } catch (err) {
    return NextResponse.json({ error: "Error al limpiar la base de datos" }, { status: 500 })
  }
}
