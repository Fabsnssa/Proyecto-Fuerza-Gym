import { NextResponse } from "next/server"
import { getMetricById, updateMetric, deleteMetric } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const metric = getMetricById(id)
  if (!metric) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
  }
  return NextResponse.json(metric)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const updated = updateMetric(id, body)
    if (!updated) {
      return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = deleteMetric(id)
  if (!deleted) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 })
  }
  return NextResponse.json({ message: "Registro eliminado" })
}
