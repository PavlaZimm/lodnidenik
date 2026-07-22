import type { Metadata } from "next"
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"

// latin-ext je nutný kvůli české diakritice (ě, š, č, ř, ž, ů…).
// next/font vyžaduje doslovné literály, proto se seznam opakuje.
const fontDisplay = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
})

const fontBody = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Rodinný lodní deník",
  description:
    "Rodinný deník cest z dovolených — mapa s trasou, fotky a zápisky ze zastávek.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="cs"
      className={cn(
        "antialiased",
        fontDisplay.variable,
        fontBody.variable,
        fontMono.variable
      )}
    >
      <body>{children}</body>
    </html>
  )
}
