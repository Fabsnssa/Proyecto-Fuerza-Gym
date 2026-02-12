"use client"

import useSWR from "swr"
import {
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MetricRecord {
  id: string
  fecha: string
  peso: number
  altura: number
  imc: number
  grasaCorporal: number
  masaMuscular: number
}

// Compute HSL colors from CSS vars in JS for Recharts compatibility
const COLORS = {
  peso: "hsl(200, 70%, 50%)",
  imc: "hsl(142, 60%, 45%)",
  grasa: "hsl(38, 92%, 50%)",
  musculo: "hsl(340, 65%, 55%)",
}

export function ProgressCharts({ usuarioId }: { usuarioId: string }) {
  const { data: metrics } = useSWR<MetricRecord[]>(
    `/api/metrics?usuarioId=${usuarioId}`
  )

  if (!metrics || metrics.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No hay registros para generar graficos.
        </CardContent>
      </Card>
    )
  }

  const chartData = metrics.map((m) => ({
    fecha: m.fecha,
    peso: m.peso,
    imc: m.imc,
    grasa: m.grasaCorporal,
    musculo: m.masaMuscular,
  }))

  return (
    <Tabs defaultValue="all" className="flex flex-col gap-4">
      <TabsList className="w-fit">
        <TabsTrigger value="all">Vista General</TabsTrigger>
        <TabsTrigger value="peso">Peso</TabsTrigger>
        <TabsTrigger value="imc">IMC</TabsTrigger>
        <TabsTrigger value="composicion">Composicion</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">
                Evolucion del Peso
              </CardTitle>
              <CardDescription>Peso corporal en kg</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  peso: { label: "Peso (kg)", color: COLORS.peso },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="pesoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.peso} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.peso} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="peso"
                      stroke={COLORS.peso}
                      fill="url(#pesoGrad)"
                      strokeWidth={2}
                      name="Peso (kg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">
                Evolucion del IMC
              </CardTitle>
              <CardDescription>
                Indice de Masa Corporal calculado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  imc: { label: "IMC", color: COLORS.imc },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="imcGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.imc} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.imc} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="imc"
                      stroke={COLORS.imc}
                      fill="url(#imcGrad)"
                      strokeWidth={2}
                      name="IMC"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">
                Grasa Corporal
              </CardTitle>
              <CardDescription>Porcentaje de grasa</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  grasa: { label: "Grasa (%)", color: COLORS.grasa },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="grasaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.grasa} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.grasa} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="grasa"
                      stroke={COLORS.grasa}
                      fill="url(#grasaGrad)"
                      strokeWidth={2}
                      name="Grasa (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base">
                Masa Muscular
              </CardTitle>
              <CardDescription>Masa muscular en kg</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  musculo: { label: "Musculo (kg)", color: COLORS.musculo },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="musculoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.musculo} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.musculo} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="musculo"
                      stroke={COLORS.musculo}
                      fill="url(#musculoGrad)"
                      strokeWidth={2}
                      name="Musculo (kg)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="peso">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              Evolucion Detallada del Peso
            </CardTitle>
            <CardDescription>
              Historial completo del peso corporal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                peso: { label: "Peso (kg)", color: COLORS.peso },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke={COLORS.peso}
                    strokeWidth={3}
                    dot={{ r: 5, fill: COLORS.peso }}
                    activeDot={{ r: 7 }}
                    name="Peso (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="imc">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              Evolucion Detallada del IMC
            </CardTitle>
            <CardDescription>
              Indice de Masa Corporal a lo largo del tiempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                imc: { label: "IMC", color: COLORS.imc },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="imc"
                    stroke={COLORS.imc}
                    strokeWidth={3}
                    dot={{ r: 5, fill: COLORS.imc }}
                    activeDot={{ r: 7 }}
                    name="IMC"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="composicion">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">
              Composicion Corporal
            </CardTitle>
            <CardDescription>
              Grasa corporal vs. Masa muscular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                grasa: { label: "Grasa (%)", color: COLORS.grasa },
                musculo: { label: "Musculo (kg)", color: COLORS.musculo },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="grasa"
                    stroke={COLORS.grasa}
                    strokeWidth={3}
                    dot={{ r: 5, fill: COLORS.grasa }}
                    name="Grasa (%)"
                  />
                  <Line
                    type="monotone"
                    dataKey="musculo"
                    stroke={COLORS.musculo}
                    strokeWidth={3}
                    dot={{ r: 5, fill: COLORS.musculo }}
                    name="Musculo (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
