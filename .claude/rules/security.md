# Security — platí vždy

- **Žádné secrets v kódu ani gitu. Nikdy.** Klíče/tokeny jen přes env proměnné. Ověř, že `.env` je v `.gitignore` před každým commitem.
- **NEXT_PUBLIC_ jen pro skutečně veřejné hodnoty** (Mapy.com klíč omezený na doménu je ok; Supabase anon key je ok). Service-role klíč NIKDY do klientského kódu.
- **RLS by default** — Row Level Security zapnutá na všech tabulkách. Zápis jen vlastník (`owner_id = auth.uid()`). Žádné blanket "ALL" policy.
- **Veřejné čtení jen přes `share_token`** — dlouhý náhodný string, ne sekvenční ID. Přístup k výpravě po tokenu.
- **Storage bucket není veřejný** — fotky přes signed URLs, jen pro danou (sdílenou) výpravu.
- **EXIF/soukromí** — u veřejného sdílení nezobrazovat GPS fotek „z domova", umožnit skrýt pin, nabídnout strip GPS metadat. Upozornit uživatele.
- **Upload validace** — jen obrázky (MIME i přípona), limit velikosti, sanitizace názvu, uložení mimo public root.
- **Input validace server-side** (schema-based, např. Zod). Nikdy nedůvěřuj klientské validaci.
- **Rate limiting** na auth a upload endpointech.
- Navrhni `/security-review` při práci na auth, uploadu, sdílení nebo user datech.
