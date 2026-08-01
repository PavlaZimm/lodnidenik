"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface PhotoLightboxProps {
  url: string | null
  onClose: () => void
}

export function PhotoLightbox({ url, onClose }: PhotoLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  if (!url) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-zoom-out"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X className="size-6" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl border border-white/10 cursor-default"
      >
        <img src={url} alt="Fotka z plavby" className="max-w-full max-h-[85vh] object-contain" />
      </div>
    </div>
  )
}
