"use client"

import useSWR from "swr"
import { TrendingUp, TrendingDown, Minus, Scale, Percent, Dumbbell, Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface UserStats {
  totalRegistros: number
  cambioPeso: number
  cambioIMC: number
  cambioGrasa: number
  cambioMusculo: number
  ultimoRegistro: {
    peso: number
    imc: number
    grasaCorporal: number
    masaMuscular: number
  }
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <TrendingUp className="h-4 w-4" />
  if (value < 0) return <TrendingDown className="h-4 w-4" />
  return <Minus className="h-4 w-4" />
}

function trendColor(value: number, invertGood = false) {
  if (value === 0) return "text-muted-foreground"
  const isPositive = value > 0
  const isGood = invertGood ? !isPositive : isPositive
  return isGood ? "text-primary" : "text-destructive"
}

export function StatsCards({ usuarioId }: { usuarioId: string }) {
  const { data: stats } = useSWR<UserStats>(
    `/api/stats?usuarioId=${usuarioId}`
  )

  if (!stats) return null

  const cards = [
    {
      label: "Peso Actual",
      value: `${stats.ultimoRegistro.peso} kg`,
      change: stats.cambioPeso,
      unit: "kg",
      icon: Scale,
      invertGood: true,
      color: "text-[hsl(200,70%,50%)]",
      bgColor: "bg-[hsl(200,70%,50%)]/10",
    },
    {
      label: "IMC Actual",
      value: stats.ultimoRegistro.imc,
      change: stats.cambioIMC,
      unit: "",
      icon: Activity,
      invertGood: true,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Grasa Corporal",
      value: `${stats.ultimoRegistro.grasaCorporal}%`,
      change: stats.cambioGrasa,
      unit: "%",
      icon: Percent,
      invertGood: true,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Masa Muscular",
      value: `${stats.ultimoRegistro.masaMuscular} kg`,
      change: stats.cambioMusculo,
      unit: "kg",
      icon: Dumbbell,
      invertGood: false,
      color: "text-[hsl(340,65%,55%)]",
      bgColor: "bg-[hsl(340,65%,55%)]/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bgColor}`}
              >
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${trendColor(c.change, c.invertGood)}`}
              >
                <TrendIcon value={c.invertGood ? -c.change : c.change} />
                <span>
                  {c.change > 0 ? "+" : ""}
                  {c.change}
                  {c.unit}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-card-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
