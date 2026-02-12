import { NextResponse } from "next/server"
import { getMetrics, getMetricsByUser, createMetric } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const usuarioId = searchParams.get("usuarioId")

  if (usuarioId) {
    const metrics = getMetricsByUser(usuarioId)
    return NextResponse.json(metrics)
  }

  const metrics = getMetrics()
  return NextResponse.json(metrics)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { usuarioId, fecha, peso, altura, grasaCorporal, masaMuscular, notas } = body

    if (!usuarioId || !fecha || peso == null || altura == null || grasaCorporal == null || masaMuscular == null) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    // Validation
    if (peso <= 0 || peso > 300) {
      return NextResponse.json({ error: "Peso debe estar entre 0 y 300 kg" }, { status: 400 })
    }
    if (altura <= 0 || altura > 250) {
      return NextResponse.json({ error: "Altura debe estar entre 0 y 250 cm" }, { status: 400 })
    }
    if (grasaCorporal < 0 || grasaCorporal > 100) {
      return NextResponse.json({ error: "Grasa corporal debe estar entre 0 y 100%" }, { status: 400 })
    }
    if (masaMuscular < 0 || masaMuscular > 200) {
      return NextResponse.json({ error: "Masa muscular debe estar entre 0 y 200 kg" }, { status: 400 })
    }

    const metric = createMetric({
      usuarioId,
      fecha,
      peso: Number(peso),
      altura: Number(altura),
      grasaCorporal: Number(grasaCorporal),
      masaMuscular: Number(masaMuscular),
      notas: notas || "",
    })

    return NextResponse.json(metric, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Error al crear la metrica" },
      { status: 500 }
    )
  }
}
