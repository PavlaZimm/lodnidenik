import type { Metadata, Viewport } from "next"
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B6E78",
}

export const metadata: Metadata = {
  title: "Rodinný lodní deník",
  description: "Rodinný deník cest z dovolených — mapa s trasou, fotky a zápisky ze zastávek.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lodní deník",
  },
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
      <body className="pb-20 md:pb-0 select-none">{children}</body>
    </html>
  )
}
