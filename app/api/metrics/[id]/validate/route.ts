import { NextResponse } from "next/server"
import { validateMetric } from "@/lib/db"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { supervisorId } = body

    if (!supervisorId) {
      return NextResponse.json(
        { error: "Se requiere el ID del supervisor" },
        { status: 400 }
      )
    }

    const validated = validateMetric(id, supervisorId)
    if (!validated) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }

    return NextResponse.json(validated)
  } catch {
    return NextResponse.json({ error: "Error al validar" }, { status: 500 })
  }
}
