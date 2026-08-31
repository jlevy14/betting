# LETS MAKE A BILLION

An intentionally hideous (Windows 98 / 2003-Notepad chic) tracker for a 12-person
fantasy side-game:

- Every week, all 12 members chip in **$1** ($12 total).
- Each member picks **one NFL player** they think scores an **anytime touchdown**.
- The commissioner places a single **$12, 12-leg anytime-TD parlay** on DraftKings.
- If all 12 legs hit, the winnings are **split 12 ways**.

The site tracks each player's TDs in near real time (via ESPN's public data) and
shows how close the ticket is to cashing, plus the potential payout per person.

> For entertainment among friends only. This site does not place bets, is not
> affiliated with the NFL or DraftKings, and stats are unofficial (ESPN).

---

## How it works

- **`/`  The Board** (public): the current week's 12 picks, live HIT / MISS /
  PLAYING status, the giant blinking payout, a per-person share, a "legs hit"
  thermometer, and a DEAD banner if the ticket busts. Auto-refreshes while games
  are live. Past weeks are browsable at the bottom.
- **`/pick`** (league password): choose your name, then pick a player from a giant
  dropdown of everyone playing that week. No two managers can pick the same
  player, and your pick **locks when that player's game kicks off**. QB *passing*
  TDs do **not** count -- the player has to rush/receive/return/defense a TD.
- **`/admin`** (commissioner password): rename the 12 managers, enter the
  DraftKings "to win" amount, force a stats refresh, and manually override or
  clear any leg if ESPN is wrong.

### Anytime-TD rule

A leg is a **HIT** if the player records a touchdown in any of these box-score
categories: rushing, receiving, kick return, punt return, interception return,
fumble return, or defensive. Passing touchdowns are deliberately excluded.

---

## Tech

- Next.js (App Router) + TypeScript + React
- Prisma ORM
- Supabase Postgres (local + production)
- Hosted on Vercel
- ESPN's public NFL JSON endpoints (no API key)

---

## Local development

Requires Node 20+ and a Supabase project (see step 1-2 below to get the
connection strings). The app talks to the same Supabase database locally and in
production.

```bash
npm install
cp .env.example .env      # paste your Supabase DATABASE_URL + DIRECT_URL, set passwords
npx prisma db push        # creates the tables in Supabase
npm run dev               # http://localhost:3000
```

Default passwords (from `.env.example`):

- League: `letsgo`
- Commissioner: `changeme`

Change them in `.env`. The 12 members and the current week auto-create on first
page load, so `npm run db:seed` is optional.

---

## Deploying to Vercel + Supabase (production)

### 1. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. Choose a **database password** when prompted (save it -- it's part of the
   connection strings).

### 2. Get the two connection strings

In Supabase: **Project -> Connect -> ORMs tab -> Prisma**. It shows two lines,
`DATABASE_URL` (Transaction pooler, port 6543) and `DIRECT_URL` (Session pooler,
port 5432), already filled in with your project ref. Copy both. (If it shows a
`[YOUR-PASSWORD]` placeholder, replace it with your DB password.)

### 3. Create the tables in Supabase

Put those two URLs (plus your passwords) into a local `.env`, then run:

```bash
npx prisma db push
```

Prisma uses `DIRECT_URL` for this. The 12 members and current week auto-create on
first page load, so no seeding is needed in production.

### 4. Push to GitHub and import into Vercel

The repo is at `https://github.com/jlevy14/betting.git`. Once it's pushed
(see below), go to Vercel: **Add New Project -> Import** the `jlevy14/betting`
repo. It auto-detects Next.js.

### 5. Set environment variables in Vercel

Under Project Settings -> Environment Variables (Production, Preview,
Development):

| Variable           | Value                                              |
| ------------------ | -------------------------------------------------- |
| `DATABASE_URL`     | Supabase Transaction pooler URL (port 6543)        |
| `DIRECT_URL`       | Supabase Session pooler URL (port 5432)            |
| `LEAGUE_PASSWORD`  | the password you give to all 12 members            |
| `COMMISH_PASSWORD` | a separate password only you know                  |

Deploy. The build runs `prisma generate` automatically.

### 6. Point the domain

In Vercel: Project -> Settings -> **Domains** -> add `letsmakeabillion.com`
(and `www`). Follow Vercel's DNS instructions at your registrar (either switch
the nameservers to Vercel, or add the A/CNAME records they show).

---

## Weekly routine (commissioner)

1. Early in the week, tell the group to go to `/pick` and lock in their guy.
2. Before the **earliest kickoff among the picks** (the board shows this time),
   build the 12-leg anytime-TD parlay on DraftKings with everyone's players.
3. Screenshot the ticket, then paste the **To Win** amount into `/admin`.
4. On game day, the board tracks it live. Enjoy the chaos.

---

## Environment variables

| Variable           | Required | Notes                                              |
| ------------------ | -------- | -------------------------------------------------- |
| `DATABASE_URL`     | yes      | Supabase Transaction pooler URL (port 6543)        |
| `DIRECT_URL`       | yes      | Supabase Session pooler URL (port 5432)            |
| `LEAGUE_PASSWORD`  | yes      | shared password for all members to submit picks    |
| `COMMISH_PASSWORD` | yes      | commissioner-only password for `/admin`            |

> Note on security: this is a friends-only game. Auth is a shared password plus a
> signed cookie -- anyone with the league password can submit a pick as any name.
> The commissioner can fix mistakes in `/admin`. Don't treat it as real security.
