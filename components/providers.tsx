"use client"

import React from "react"

import { SWRConfig } from "swr"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <SWRConfig value={{ fetcher, revalidateOnFocus: true }}>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </SWRConfig>
    </ThemeProvider>
  )
}
