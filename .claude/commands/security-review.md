# Security Review

Proveď bezpečnostní review právě změněného kódu jako senior security auditor.

1. Zkontroluj, jestli nejsou secrets v kódu nebo v commitnutých souborech
2. Ověř RLS policies (zápis jen vlastník, čtení přes token, žádné blanket ALL)
3. Zkontroluj Storage — bucket není veřejný, signed URLs
4. Ověř upload validaci (MIME, velikost, sanitizace názvu)
5. Zkontroluj input validaci (server-side, schema)
6. EXIF/soukromí — neúniká domácí GPS u veřejného sdílení
7. Rate limiting na write/upload/auth

Výstup: seznam nálezů [SEVERITY: HIGH/MEDIUM/LOW] → konkrétní oprava.
