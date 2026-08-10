# Deploying sagetarot.app

This repo is the published copy of Sage. It is a plain static site — no build
step, no dependencies, no server. GitHub Pages serves the files exactly as they
are committed.

Working copy lives in `D:\Projects\active\sage`. Develop there, publish here.

---

## Publishing an update

Copy everything across from the working copy, skipping git metadata and the
unused duplicate image folder. In PowerShell:

```powershell
$src = "D:\Projects\active\sage"
$dst = "D:\Projects\active\sagetarot.app-site"

Get-ChildItem -LiteralPath $src -Force |
  Where-Object { $_.Name -ne '.git' } |
  ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $dst -Recurse -Force }

Remove-Item -LiteralPath "$dst\images\rider_waite_tarot" -Recurse -Force -ErrorAction SilentlyContinue
```

This overwrites but never deletes, so `CNAME`, `.nojekyll`, `.gitignore` and this
file survive.

`robocopy` does the same thing in one line, but it is not always on PATH — call
it by full path if `robocopy` alone is not recognised:

```powershell
& "$env:SystemRoot\System32\Robocopy.exe" $src $dst /E /XD ".git" "rider_waite_tarot"
```

Note that robocopy exits with a non-zero code on success. That is normal.

Then:

```
cd D:\Projects\active\sagetarot.app-site
git add -A
git commit -m "Update"
git push
```

GitHub Pages redeploys within a minute or so.

---

## What must not be deleted

| File | Why |
|---|---|
| `CNAME` | Contains `sagetarot.app`. Without it the custom domain detaches and the site reverts to the github.io URL. GitHub rewrites this file whenever you change the domain in Settings → Pages. |
| `.nojekyll` | Tells Pages to serve the files as-is rather than running them through Jekyll. Jekyll ignores anything starting with an underscore and slows deploys down. |

---

## First-time setup

Already done, recorded here in case it needs redoing.

**GitHub:** Settings → Pages → Build and deployment → Source: *Deploy from a
branch* → Branch `main`, folder `/ (root)` → Save. Then set Custom domain to
`sagetarot.app`, wait for the DNS check to pass, and tick **Enforce HTTPS**.

**Namecheap** (Domain List → Manage → Advanced DNS). Delete the parking-page
records first, then add:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | lweiss01.github.io. |

Optional IPv6, same `@` host: `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153` as AAAA records.

Nameservers on the Domain tab must be **Namecheap BasicDNS**, or the Advanced DNS
records are ignored.

---

## Things that bite

**Filename case.** Windows does not care about case; the Linux servers behind
Pages do. An image referenced as `Cups01.jpg` but committed as `cups01.jpg` works
perfectly on your machine and 404s in production. After every deploy that touches
images, open the live site and run **Settings → Check all 78 images**.

**`.app` demands HTTPS.** The `.app` top-level domain is on the browser HSTS
preload list, so plain `http://` is refused outright — there is no insecure
fallback. Between attaching the domain and GitHub issuing the certificate the
site will look broken. Usually minutes; allow up to 24 hours before worrying.

**Nothing secret is in here.** API keys, readings, notes and birth date all live
in the visitor's own browser storage, never in these files. The repo can be
public safely.
