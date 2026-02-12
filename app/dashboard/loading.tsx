import { Dumbbell } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-primary/10">
          <Dumbbell className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
