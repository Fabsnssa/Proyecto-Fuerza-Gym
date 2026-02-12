import { NextResponse } from "next/server"
import { getUsers, createUser } from "@/lib/db"

export async function GET() {
  const users = getUsers()
  return NextResponse.json(users)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, apellido, cedula, edad, sexo, email, rol } = body

    if (!nombre || !apellido || !cedula || !edad || !sexo || !email) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    const user = createUser({
      nombre,
      apellido,
      cedula,
      edad: Number(edad),
      sexo,
      email,
      rol: rol || "usuario",
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    )
  }
}
