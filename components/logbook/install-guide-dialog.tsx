"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, Share, PlusSquare, MoreVertical, X, CheckCircle2 } from "lucide-react"

interface InstallGuideDialogProps {
  onClose: () => void
}

export function InstallGuideDialog({ onClose }: InstallGuideDialogProps) {
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent
    setIsIos(/iPhone|iPad|iPod/i.test(ua))
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/40">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <Smartphone className="size-6" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Uložit Lodní deník na plochu
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Jednoduché otvírání jako aplikace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body Instructions */}
        <div className="p-5 space-y-5 text-sm">
          {isIos ? (
            /* iPhone (Safari) Návod */
            <div className="space-y-4">
              <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-primary text-white size-6 rounded-full flex items-center justify-center">
                  1
                </span>
                <div className="flex-1">
                  <span>Dole v prohlížeči Safari klepněte na tlačítko</span>
                  <strong className="flex items-center gap-1.5 text-primary mt-0.5">
                    <Share className="size-4" /> Sdílet (čtvereček se šipkou)
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-primary text-white size-6 rounded-full flex items-center justify-center">
                  2
                </span>
                <div className="flex-1">
                  <span>V nabídce zvolte a klepněte na</span>
                  <strong className="flex items-center gap-1.5 text-primary mt-0.5">
                    <PlusSquare className="size-4" /> Přidat na plochu
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            /* Android (Chrome) Návod */
            <div className="space-y-4">
              <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-primary text-white size-6 rounded-full flex items-center justify-center">
                  1
                </span>
                <div className="flex-1">
                  <span>Vpravo nahoře v prohlížeči Chrome klepněte na</span>
                  <strong className="flex items-center gap-1.5 text-primary mt-0.5">
                    <MoreVertical className="size-4" /> Tři tečky (Menu)
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center gap-3">
                <span className="font-mono text-xs font-bold bg-primary text-white size-6 rounded-full flex items-center justify-center">
                  2
                </span>
                <div className="flex-1">
                  <span>Vyberte položku</span>
                  <strong className="flex items-center gap-1.5 text-primary mt-0.5">
                    <PlusSquare className="size-4" /> Přidat na plochu / Instalovat
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-success/10 border border-success/30 rounded-xl text-xs text-foreground flex items-start gap-2.5">
            <CheckCircle2 className="size-4 text-success shrink-0 mt-0.5" />
            <span>
              Po přidání na plochu se aplikace rodičům zobrazí přímo mezi ostatními ikonami na telefonu a otevře se jedním dotykem bez zadávání adresy.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end">
          <Button onClick={onClose} size="lg" className="w-full">
            Rozumím
          </Button>
        </div>
      </div>
    </div>
  )
}
