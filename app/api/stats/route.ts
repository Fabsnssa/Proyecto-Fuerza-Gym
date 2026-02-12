import { NextResponse } from "next/server"
import { getStatsForUser, getGlobalStats } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuarioId = searchParams.get("usuarioId")

  if (usuarioId) {
    const stats = getStatsForUser(usuarioId)
    if (!stats) {
      return NextResponse.json({ error: "No hay datos para este usuario" }, { status: 404 })
    }
    return NextResponse.json(stats)
  }

  const stats = getGlobalStats()
  return NextResponse.json(stats)
}
