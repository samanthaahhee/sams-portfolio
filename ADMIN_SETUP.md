# Internal dashboard — setup guide

The portfolio now has an internal admin at **`/admin`** backed by Vercel Postgres + Vercel Blob. Public pages read from the database with a graceful fallback to the static TypeScript data files if the DB isn't configured yet.

## What you need to do (one-time setup)

### 1. Provision Vercel Postgres
1. Go to **Vercel dashboard → your project → Storage tab → Create database → Postgres**
2. Pick a name (e.g. `sam-portfolio-db`) and a region close to you (Sydney = `syd1`)
3. Click **Connect** to attach it to the `sam-ahhee-portfolio` project
4. Vercel auto-injects `POSTGRES_URL` and related env vars

### 2. Provision Vercel Blob
1. **Vercel dashboard → Storage → Create database → Blob**
2. Connect to the same project
3. Vercel auto-injects `BLOB_READ_WRITE_TOKEN`

### 3. Set the admin password
**Vercel dashboard → your project → Settings → Environment Variables**

Add:
```
ADMIN_PASSWORD = <pick a strong password>
```
Apply to Production, Preview, and Development.

### 4. Pull env vars locally
```bash
cd "/Users/samanthaahhee/Sam Ahhee Portfolio"
vercel env pull
```
This creates `.env.local` with all the connection strings.

### 5. Run the migration
```bash
npm run db:migrate
```
Creates the `projects` and `case_studies` tables.

### 6. Seed with current static data
```bash
npm run db:seed
```
Copies everything from `src/lib/projects.ts` and `src/lib/case-studies.ts` into the database. Idempotent — safe to re-run.

### 7. Redeploy
```bash
npx vercel --prod --yes
```
The production build will now read from Postgres.

### 8. Log in
- Go to **`https://sam-ahhee-portfolio.vercel.app/admin/login`**
- Enter `ADMIN_PASSWORD`
- Dashboard, projects list, edit forms — all live

## What's wired

- **`/admin`** — Dashboard with project + case study counts
- **`/admin/projects`** — List of all projects
- **`/admin/projects/[slug]`** — Edit project (brand, title, tag, palette, year, description, cover image, gallery, external link)
- **`/admin/projects/new`** — Create new project
- **Image upload** — Drag-and-drop into the form; uploads to Vercel Blob, returns a public URL automatically wired into `cover` or `gallery`
- **Logout** — top-right of the admin header
- **Public pages** — `/`, `/projects/[slug]`, `/work/[slug]` all read from the DB

## What's NOT yet in the dashboard

- Case study CRUD — edit case studies via `src/lib/case-studies.ts` for now, re-seed if needed. (Easy to add to the dashboard if you want — it's the same pattern as projects.)
- Reordering — projects show in the order they were added. Easy to add drag-to-reorder later.
- Image cropping / resizing — uploads are raw to Blob. For the heavy `sam-portrait.png` (9.7 MB), an external compressor will still beat browser-side resizing.

## Fallback behaviour

If `POSTGRES_URL` isn't set OR a query fails, public pages fall back to the static arrays in `src/lib/projects.ts` and `src/lib/case-studies.ts`. So the live site stays up even if the DB is misconfigured.
