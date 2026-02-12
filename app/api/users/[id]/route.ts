import { NextResponse } from "next/server"
import { getUserById, updateUser, deleteUser } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = getUserById(id)
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }
  return NextResponse.json(user)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const updated = updateUser(id, body)
    if (!updated) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
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
  const deleted = deleteUser(id)
  if (!deleted) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }
  return NextResponse.json({ message: "Usuario eliminado" })
}
