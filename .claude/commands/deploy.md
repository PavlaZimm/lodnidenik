# Deploy

1. Spusť `npm run build` — musí projít bez chyb
2. Spusť `npm run lint`
3. Ověř, že `.env` je v `.gitignore` a `.env.example` je aktuální
4. Zkontroluj atribuci mapy (© OpenStreetMap, © OpenSeaMap, příp. Mapy.com) a případný Mapy.com klíč v .env
5. Ověř RLS policies na produkční Supabase
6. Až na explicitní pokyn: commit + push do main (Vercel auto-deploy)
7. Po deployi ověř funkčnost na produkční URL
