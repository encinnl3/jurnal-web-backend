# PKL Journal — OpenCode Build Prompt

> **Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · GSAP · Supabase · Framer Motion (only where GSAP is insufficient)
> **No purple anywhere.** Accent palette: teal (`#00B4A6`), orange (`#F97316`), slate/grey neutrals, near-black backgrounds.

---

## 1. Project Overview

Build a **PKL (Praktik Kerja Lapangan) Journal** website — a personal internship diary shared among **exactly 3 intern profiles**. The site is visually premium, inspired by `nickho-motorsports.nl`: full-bleed dark backgrounds, cinematic hero sections, smooth scroll-triggered animations, large editorial typography, and a strong contrast between near-black canvas and bright accent text.

Public visitors can only **read**. Each of the 3 interns has their own **profile-level admin panel** to edit their own journal. A hidden **super-admin** can manage all 3 profiles (create, configure, assign).

---

## 2. Visual Identity & Design Language

### 2.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0A0A0A` | Page background, hero, sections |
| `--bg-secondary` | `#111111` | Cards, nav backdrop, modals |
| `--bg-tertiary` | `#1A1A1A` | Input fields, table rows, hover states |
| `--border` | `#2A2A2A` | Dividers, card borders, input borders |
| `--text-primary` | `#F5F5F5` | Headlines, body copy |
| `--text-secondary` | `#A0A0A0` | Subtitles, captions, metadata |
| `--text-muted` | `#555555` | Placeholder text, disabled states |
| `--accent-teal` | `#00B4A6` | Primary CTA buttons, active nav, links, tags |
| `--accent-teal-dim` | `#007A70` | Teal hover states, teal border glow |
| `--accent-orange` | `#F97316` | Secondary accent, date badges, notification dots |
| `--accent-orange-dim` | `#C05A0D` | Orange hover states |
| `--white` | `#FFFFFF` | Button labels on dark fills |

**No white backgrounds on any section.** The entire site lives in the `#0A0A0A`–`#1A1A1A` dark range.

### 2.2 Typography

Use Google Fonts, loaded via `next/font`:

| Role | Font | Weight(s) | Letter-spacing |
|---|---|---|---|
| Display / Hero | `Space Grotesk` | 700, 800 | `-0.03em` to `-0.05em` (tight) |
| Body / Reading | `Inter` | 400, 500 | `0` (normal) |
| Mono / Data | `JetBrains Mono` | 400 | `0` |
| Label / Badge | `Inter` uppercase | 600, letter-spacing `0.12em` | Wide-tracked |

**Type scale (rem):**

```
--text-xs:   0.75rem   / 12px   — captions, metadata
--text-sm:   0.875rem  / 14px   — body small, labels
--text-base: 1rem      / 16px   — body copy
--text-lg:   1.125rem  / 18px   — lead paragraph
--text-xl:   1.25rem   / 20px   — card titles
--text-2xl:  1.5rem    / 24px   — section subtitles
--text-3xl:  1.875rem  / 30px   — section headings
--text-4xl:  2.25rem   / 36px   — large section headings
--text-5xl:  3rem      / 48px   — hero sub-headline
--text-7xl:  4.5rem    / 72px   — hero name (desktop)
--text-9xl:  8rem      / 128px  — large decorative
```

**Hero headline** (`Space Grotesk 800`, `--text-7xl` on desktop, `--text-4xl` on mobile, line-height `0.9`, letter-spacing `-0.04em`).

### 2.3 Spacing & Layout

- Max content width: `1280px`, centered, with `px-6` (24px) side padding on mobile and `px-12` (48px) on desktop.
- Section vertical padding: `py-24` (96px) on desktop, `py-16` (64px) on mobile.
- Card inner padding: `p-6` (24px) desktop, `p-4` (16px) mobile.
- Grid gaps: `gap-6` (24px) standard, `gap-4` (16px) dense.

### 2.4 Border Radius & Surfaces

- Cards / modals: `rounded-2xl` (16px)
- Buttons: `rounded-full` (pill) for primary; `rounded-xl` (12px) for secondary/utility
- Inputs: `rounded-xl` (12px)
- Avatar images: `rounded-full`
- Gallery thumbnails: `rounded-lg` (8px)
- Zero border-radius on full-bleed section dividers

### 2.5 Shadows & Glow

- Card hover: `box-shadow: 0 0 0 1px #00B4A6, 0 8px 32px rgba(0,180,166,0.12)`
- Button focus: `outline: 2px solid #00B4A6; outline-offset: 2px`
- Modal backdrop: `backdrop-filter: blur(12px)` on a `rgba(0,0,0,0.7)` overlay
- No flat color shadows. All glows use teal or orange.

---

## 3. Site Structure & Pages

```
/                        → Landing page (read-only)
/profiles                → Grid of 3 intern profiles (read-only)
/profiles/[slug]         → Individual intern journal (read-only)
/profiles/[slug]/admin   → Profile-level admin panel (auth required)
/admin                   → Super-admin panel (hidden, auth required)
/login                   → Shared login page (routes by role after auth)
```

---

## 4. Page-by-Page Specification

---

### 4.1 Landing Page (`/`)

#### Navbar

- Position: `fixed top-0`, full-width, `z-50`
- Background: transparent on load → `bg-[#111111]/90 backdrop-blur-md` after scrolling 80px (GSAP ScrollTrigger toggle)
- Height: `64px` desktop, `56px` mobile
- Left: site logo — `Space Grotesk 700`, text `"PKL JOURNAL"`, `--text-lg`, color `--text-primary`. The word "JOURNAL" in `--accent-teal`.
- Right: nav links `["Profil", "Jurnal", "Tentang", "Kontak"]` — `Inter 500`, `--text-sm`, `--text-secondary` on idle, `--text-primary` on hover (teal underline `2px` animates in via CSS `transition`). On mobile: hamburger icon (three bars, `24px`) → fullscreen overlay menu.
- Hamburger overlay: `bg-[#0A0A0A]`, full viewport, links stacked vertically `Space Grotesk 700 --text-4xl`, slide in from right with GSAP `xPercent: 100 → 0`.

#### Hero Section

- Full-viewport height (`100svh`), `position: relative`, `overflow: hidden`
- **Background:** full-bleed dark image (intern group photo or placeholder). Apply a CSS gradient overlay: `linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 60%, #0A0A0A 100%)`.
- **Parallax:** GSAP ScrollTrigger on the background image, `y: "30%"` as user scrolls from 0 to `100vh`. `scrub: true`.
- **Content** (centered, `max-w-3xl`):
  - Eyebrow label: `Inter 600 uppercase --text-xs tracking-widest --accent-teal` — `"LAPORAN PRAKTIK KERJA LAPANGAN"`
  - Main headline: `Space Grotesk 800 --text-7xl (mobile: --text-4xl)` — `"Jurnal Magang Kami"`. Line break after `"Jurnal"`. Color `--text-primary`.
  - Subtext: `Inter 400 --text-lg --text-secondary max-w-md` — one sentence describing the PKL site.
  - Stat row (3 stats side by side with thin `1px #2A2A2A` dividers):
    - `"3"` large `Space Grotesk 800 --text-5xl --accent-teal` + label `"Peserta Magang"` `Inter 400 --text-sm --text-secondary`
    - `"10"` + `"Minggu PKL"`
    - `"2025"` + `"Tahun Pelaksanaan"`
  - Primary CTA: `"Lihat Profil"` → pill button, `bg-[--accent-teal]`, `text-[--bg-primary]`, `Inter 600 --text-sm`, `px-8 py-3`, hover: `bg-[--accent-teal-dim]` + `scale(1.02)` GSAP tween `duration: 0.2`.
  - Secondary CTA: `"Baca Jurnal"` → outlined pill button, `border border-[--border]`, `text-[--text-primary]`, same size, hover: `border-[--accent-teal] text-[--accent-teal]`.
- **Entrance animation (GSAP timeline, plays once on load):**
  1. Eyebrow: `from { opacity:0, y:20 }` → `to { opacity:1, y:0 }` `duration:0.6 ease:"power2.out"`
  2. Headline: `from { opacity:0, y:40 }` → stagger 0.1s per line `duration:0.8`
  3. Subtext: `from { opacity:0, y:20 }` `duration:0.5` delay 0.4s
  4. Stats: `from { opacity:0, y:20 }` stagger `0.08s` delay `0.6s`
  5. Buttons: `from { opacity:0, y:16 }` stagger `0.1s` delay `0.8s`
- **Scroll indicator:** bottom-center, `"Scroll"` label `Inter 400 --text-xs --text-muted tracking-widest` + animated downward chevron. GSAP: `y: [0, 8, 0]` repeat `-1` `duration:1.2 ease:"sine.inOut"`. Fades out after 20% scroll.

#### Profile Cards Section

- Eyebrow + section title pattern (used throughout):
  - Eyebrow: `Inter 600 uppercase --text-xs tracking-widest --accent-teal`
  - Title: `Space Grotesk 700 --text-4xl --text-primary`
- 3-column grid (desktop), 1-column (mobile)
- Each card:
  - Background: `bg-[#111111]` `rounded-2xl` `border border-[#2A2A2A]`
  - Top: avatar `112px × 112px` `rounded-full` `border-2 border-[--accent-teal]`, positioned overlapping the top edge of the card by `-56px` (`-mt-14` with `pt-16` inner padding correction)
  - Name: `Space Grotesk 700 --text-xl --text-primary` centered
  - Role/company badge: `Inter 600 uppercase --text-xs tracking-widest --accent-orange bg-[--accent-orange]/10 px-3 py-1 rounded-full` centered
  - Latest entry preview: `Inter 400 --text-sm --text-secondary` 3-line clamp
  - Entry count: `"N entri"` in `JetBrains Mono --text-xs --text-muted`
  - CTA link `"Baca Jurnal →"` `Inter 600 --text-sm --accent-teal` hover underline
  - **Hover state:** entire card lifts `translateY(-6px)` GSAP tween `duration:0.25`, border glows teal, shadow appears.
- **Scroll entrance:** each card `from { opacity:0, y:60 }` → `to { opacity:1, y:0 }` via ScrollTrigger `start: "top 85%"`, staggered `0.15s`.

#### About / Description Section

- Split layout: left `text` (60%), right `image` (40%) — reversed on alternating section.
- Quote pull in large `Space Grotesk 700 --text-3xl --text-primary` with left `4px teal border`.
- Descriptive paragraph `Inter 400 --text-base --text-secondary line-height-[1.8]`.
- Image: `aspect-video rounded-2xl object-cover`, parallax inner image `y: "-15%"` GSAP scrub.

#### Footer

- Background `#0A0A0A`, `border-t border-[#2A2A2A]`, `py-12`
- Two columns: left = logo + short tagline + copyright. Right = nav links in a column.
- Bottom row: `"Made with ☕ during PKL"` `Inter 400 --text-xs --text-muted` centered.

---

### 4.2 Profile List Page (`/profiles`)

Same as landing profile cards section but as a dedicated full page with hero eyebrow.

---

### 4.3 Individual Intern Journal (`/profiles/[slug]`)

#### Profile Hero

- Full-bleed section, `min-height: 70vh`
- **Parallax background** = intern's cover photo. Same overlay gradient as landing.
- Avatar floats over the bottom edge: `160px × 160px` `rounded-full` `border-4 border-[--accent-teal]` `shadow-[0_0_0_8px_rgba(0,180,166,0.15)]`
- Name: `Space Grotesk 800 --text-5xl` below avatar
- Company + role: `Inter 500 --text-lg --accent-orange`
- Bio paragraph: `Inter 400 --text-base --text-secondary max-w-2xl`
- Meta row: `"Mulai: DD MMM YYYY"` and `"Selesai: DD MMM YYYY"` in `JetBrains Mono --text-sm --text-muted`

#### Journal Entries Feed

Layout: two-column — left `280px` sticky sidebar (desktop) / hidden (mobile), right main feed.

**Sidebar:**
- Month/week filter accordion, `Inter 500 --text-sm`
- Tag filter pills: `rounded-full border border-[#2A2A2A] --text-xs --text-secondary` → active: `border-[--accent-teal] bg-[--accent-teal]/10 --accent-teal`
- Search input: `bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2 --text-sm placeholder-[--text-muted]` with `🔍` icon prefix

**Entry Cards (main feed, single column):**
Each entry:
- Date badge: `"Minggu N · DD MMM YYYY"` `JetBrains Mono --text-xs --accent-orange` above title
- Title: `Space Grotesk 700 --text-xl --text-primary`
- Content preview: `Inter 400 --text-base --text-secondary line-height-[1.8]` 4-line clamp
- Photo strip (if photos): horizontal scroll row of `80px × 80px` thumbnails `rounded-lg`, click opens lightbox
- Tags: pill badges `rounded-full bg-[#1A1A1A] border border-[#2A2A2A] --text-xs --text-secondary px-3 py-1`
- `"Baca selengkapnya"` text link `--accent-teal` `Inter 500 --text-sm`
- Divider: `1px #2A2A2A` between entries
- **Scroll entrance:** `from { opacity:0, x:-30 }` → `to { opacity:1, x:0 }` ScrollTrigger stagger `0.1s`

**Entry Detail (Modal / Expanded):**
- Opens as fullscreen overlay modal: `bg-[#111111]` slides up from bottom `GSAP fromY:100% → 0` `duration:0.5 ease:"expo.out"`. Background dims `opacity:0 → 1` `bg-[rgba(0,0,0,0.8)] backdrop-blur-sm`.
- Inside: same layout as profile page but full content, larger images in masonry grid `2-col`.
- Close button: top-right `"✕"` `36px × 36px` `rounded-full bg-[#1A1A1A] border border-[#2A2A2A] --text-secondary` hover: `border-[--accent-teal] --accent-teal`.

#### Photo Gallery (on profile page)

- Masonry grid (CSS columns: `3` desktop, `2` tablet, `1` mobile), `gap-4`
- Each photo: `rounded-lg overflow-hidden`, hover: scale `1.03` teal border glow GSAP `duration:0.25`
- Click → fullscreen lightbox: `bg-[rgba(0,0,0,0.95)]`, image centered, left/right arrow navigation GSAP `xPercent: ±100 → 0`, close on `Esc` or click outside.

---

### 4.4 Profile Admin Panel (`/profiles/[slug]/admin`)

**Access:** Login via Supabase Auth. Only the owner of this slug can write here; super-admin can also access.

**Layout:**
- Persistent left sidebar (`240px`), `bg-[#111111] border-r border-[#2A2A2A]`
- Sidebar sections: `"Profil Saya"`, `"Entri Jurnal"`, `"Foto"`, `"Pengaturan"`
- Active item: left `3px teal bar`, `bg-[--accent-teal]/8`, `--accent-teal` text
- Main area: white-on-dark content panel

**Profil Saya tab:**
- Avatar upload: drag-and-drop zone `160px` circle, dashed `2px border-[--border]` → dashed `--accent-teal` on drag-over; shows current avatar; click to open file picker. Upload to Supabase Storage.
- Cover photo upload: `16:9` ratio drag-zone with same behavior.
- Fields (all `bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 --text-sm --text-primary`):
  - Nama lengkap
  - Slug (auto-generated, editable)
  - Perusahaan / Instansi
  - Jabatan / Divisi
  - Tanggal mulai PKL (date picker)
  - Tanggal selesai PKL (date picker)
  - Bio (textarea `min-h-[120px]`)
- Save button: `"Simpan Perubahan"` primary teal pill button `px-6 py-3`
- On save: optimistic UI → success toast `"Profil berhasil disimpan ✓"` teal, slides in from top-right.

**Entri Jurnal tab:**
- Top bar: `"+ Tambah Entri"` teal pill button (right-aligned)
- Entry list: sortable by date (latest first), each row:
  - Left: date badge + title + 1-line preview
  - Right: `"Edit"` teal text button · `"Hapus"` orange text button
  - Row hover: `bg-[#1A1A1A]`
- **Add/Edit Entry drawer** (slides in from right, `480px` wide, overlay):
  - Judul entri: text input
  - Tanggal: date picker
  - Minggu ke-: number input `min:1`
  - Konten: **rich text editor** (use [Tiptap](https://tiptap.dev/) — bold, italic, lists, headings H2/H3, blockquote). Editor background `#0A0A0A`, toolbar `bg-[#1A1A1A] border-b border-[#2A2A2A]`.
  - Foto: multi-file upload (max 10 per entry), preview grid `80px × 80px`, deletable with `✕`.
  - Tags: input + Enter to add, pill display. Max 8 tags.
  - Save / Cancel buttons.
  - Delete entry: red-outlined danger button at bottom of edit drawer.

**Foto tab:**
- Photo library grid: `3-col (desktop) 2-col (tablet)`, each with hover delete `✕` overlay
- Upload zone at top: multi-drag-and-drop, accepts `.jpg .png .webp .avif`
- Photos stored in Supabase Storage under `photos/{profile_id}/{filename}`

---

### 4.5 Super-Admin Panel (`/admin`)

**Hidden entry point:** accessible only by navigating directly to `/admin`. No link from the public site anywhere.

**Auth:** separate Supabase Auth user with `role = 'super_admin'` in `profiles` table. Normal intern accounts have `role = 'intern'`.

**Dashboard:**
- Overview cards: `"3 Profil Aktif"`, `"Total Entri: N"`, `"Total Foto: N"` — `Space Grotesk 700 --text-3xl --accent-teal` + label `--text-secondary --text-sm`
- Recent activity log: list of last 20 actions (who edited what when) in `JetBrains Mono --text-xs --text-muted`

**Kelola Profil tab:**
- List all 3 profiles with: avatar thumbnail, name, entry count, last edited
- `"Edit Profil"` → opens same profile edit form as profile admin but for any user
- `"Reset Password"` → sends Supabase password reset email
- `"+ Tambah Profil"` button (only if `< 3` profiles exist — enforced both frontend and Supabase RLS)

**Add Profile form:**
- Full name, email (will be Supabase Auth user), company, role/division, start/end date
- System auto-generates slug from name
- Creates Supabase Auth user + inserts into `profiles` table with `role = 'intern'`

---

### 4.6 Login Page (`/login`)

- Centered card `max-w-md` `bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8`
- Logo top: `"PKL JOURNAL"` same as navbar treatment
- Heading: `Space Grotesk 700 --text-2xl "Masuk ke Akun"`
- Email + Password fields
- `"Masuk"` button full-width teal pill
- On error: inline error `--accent-orange --text-sm` under field
- No signup link (accounts created by super-admin only)
- On success: redirect based on role:
  - `'super_admin'` → `/admin`
  - `'intern'` → `/profiles/[their-slug]/admin`

---

## 5. Animations — Full Detail (nickho-motorsports.nl parity)

> Every animation below is **required**, not optional. Reference: `nickho-motorsports.nl` uses layered depth parallax, cursor-tracked mouse parallax, word-split text reveals, pinned horizontal scrolling, drag-scroll galleries, a live countdown, looping ticker marquees, and a "Sound on/off" toggle on a background video. Adapt each to the PKL Journal context as described.

Install:
```bash
npm install gsap @gsap/react
```

Register plugins once, globally in `app/layout.tsx` (client boundary):
```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { TextPlugin } from "gsap/TextPlugin";
gsap.registerPlugin(ScrollTrigger, Observer, TextPlugin);
```

---

### 5.1 Page Preloader / Intro Screen

Inspired by: the site's initial black screen load before content appears.

**Behavior:**
1. On first paint, a full-viewport overlay `div.preloader` covers the page: `bg-[#0A0A0A] fixed inset-0 z-[999] flex items-center justify-center`.
2. Center: the text `"PKL"` in `Space Grotesk 800 --text-9xl --text-primary`, letter-spacing starts at `0.5em`, opacity `0`.
3. GSAP timeline on mount:
   ```ts
   const tl = gsap.timeline();
   tl.to(".preloader-word", {
     opacity: 1,
     letterSpacing: "-0.04em",
     duration: 0.9,
     ease: "power4.out",
   })
   .to(".preloader-word", {
     opacity: 0,
     y: -40,
     duration: 0.5,
     ease: "power2.in",
     delay: 0.3,
   })
   .to(".preloader", {
     yPercent: -100,
     duration: 0.8,
     ease: "expo.inOut",
     onComplete: () => preloader.remove(),
   });
   ```
4. After preloader exits, trigger the hero entrance timeline (Section 5.3).
5. Skip preloader if user has visited in the same session (`sessionStorage.getItem("visited")`).

---

### 5.2 Custom Cursor

Inspired by: nickho uses a custom cursor that enlarges and changes on interactive elements.

**Implementation — `components/animations/Cursor.tsx` (client only, desktop only):**

```ts
// Two elements:
// .cursor-dot   — 8px solid teal circle, no pointer events
// .cursor-ring  — 36px circle, border-2 teal, no pointer events, lags behind

// On mousemove:
gsap.to(".cursor-dot", {
  x: e.clientX,
  y: e.clientY,
  duration: 0.05,
  ease: "none",
});
gsap.to(".cursor-ring", {
  x: e.clientX,
  y: e.clientY,
  duration: 0.18,
  ease: "power2.out",
});
```

**State changes (add/remove class + GSAP scale):**

| Trigger | `.cursor-dot` | `.cursor-ring` |
|---|---|---|
| Hover `<a>`, `<button>` | `scale(0)` | `scale(2.2)` + `bg-[--accent-teal]/20` |
| Hover profile card | `scale(0)` | `scale(3)` + inner text `"VER →"` appears (Inter 500 --text-xs white) |
| Hover gallery image | `scale(0)` | `scale(2.5)` + inner text `"DRAG"` |
| Hover journal entry | `scale(0)` | `scale(2)` + inner text `"BACA"` |
| Mouse leaves window | both `opacity: 0` |
| Mouse enters window | both `opacity: 1` |

CSS: `cursor: none` on `html` (desktop only via `@media (pointer: fine)`).

Disable entirely on touch devices: check `window.matchMedia("(pointer: coarse)")` and skip rendering.

---

### 5.3 Hero Section — Layered Depth Parallax (Mouse-Tracked)

Inspired by: nickho hero has **3 separate image layers** (background plate, car, driver) that each move at different depths in response to mouse position, creating a 3D depth illusion without WebGL.

**Structure:**
```html
<div class="hero-scene" style="position:relative; overflow:hidden; width:100%; height:100svh">
  <!-- Layer 0: background plate (moves least) -->
  <img class="hero-layer" data-depth="0.05" ...cover photo... />
  <!-- Layer 1: middle element (moves medium) -->
  <img class="hero-layer" data-depth="0.12" ...group silhouette or blurred bg... />
  <!-- Layer 2: foreground text / element (moves most) -->
  <div class="hero-layer hero-text-layer" data-depth="0.22" ...headline content... />
</div>
```

**GSAP mouse tracking:**
```ts
useEffect(() => {
  const scene = document.querySelector(".hero-scene");
  const layers = document.querySelectorAll(".hero-layer");

  const handleMouse = (e: MouseEvent) => {
    const { innerWidth: W, innerHeight: H } = window;
    // normalize -1 to +1
    const xNorm = (e.clientX / W - 0.5) * 2;
    const yNorm = (e.clientY / H - 0.5) * 2;

    layers.forEach((layer) => {
      const depth = parseFloat((layer as HTMLElement).dataset.depth || "0.1");
      const moveX = xNorm * depth * 60; // max 60px at depth 1
      const moveY = yNorm * depth * 40;
      gsap.to(layer, {
        x: moveX,
        y: moveY,
        duration: 1.2,
        ease: "power2.out",
      });
    });
  };

  window.addEventListener("mousemove", handleMouse);
  return () => window.removeEventListener("mousemove", handleMouse);
}, []);
```

**On mobile:** disable mouse tracking. Instead use CSS `@keyframes subtleFloat` — slow `y: 0 → -8px → 0` on the foreground layer, `duration: 6s infinite ease-in-out`, no parallax.

---

### 5.4 Hero Entrance — Word-Split Text Animation

Inspired by: nickho headline slides in with each word masked (clip-path or overflow hidden wrapper).

**Implementation:**

Split each word of the headline into its own `<span class="word-wrapper" style="overflow:hidden; display:inline-block">` containing a `<span class="word">` inside. GSAP animates the inner span.

```ts
gsap.timeline({ delay: 0.2 }) // after preloader
  // Eyebrow
  .from(".hero-eyebrow", {
    opacity: 0,
    y: 16,
    duration: 0.5,
    ease: "power3.out",
  })
  // Headline words — each word slides up from below its clip container
  .from(".hero-headline .word", {
    yPercent: 110,
    duration: 0.75,
    stagger: 0.08,
    ease: "power4.out",
  }, "-=0.2")
  // Subtext fade
  .from(".hero-subtext", {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: "power3.out",
  }, "-=0.4")
  // Stat items
  .from(".hero-stat", {
    opacity: 0,
    y: 24,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out",
  }, "-=0.3")
  // CTA buttons
  .from(".hero-cta", {
    opacity: 0,
    y: 16,
    stagger: 0.12,
    duration: 0.5,
    ease: "power2.out",
  }, "-=0.2");
```

---

### 5.5 Scroll Indicator — Animated Down Arrow

Inspired by: nickho has a `"See more"` text with animated arrow that disappears after scroll.

**Markup:**
```html
<div class="scroll-indicator fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20">
  <span class="text-[--text-muted] text-xs tracking-[0.2em] uppercase font-inter">Scroll</span>
  <div class="scroll-arrow w-px h-8 bg-[--text-muted] relative overflow-hidden">
    <div class="scroll-line absolute top-0 left-0 w-full h-full bg-[--accent-teal]" />
  </div>
</div>
```

**GSAP:**
```ts
// Animate the teal line sliding down repeatedly
gsap.to(".scroll-line", {
  yPercent: 100,
  duration: 1.0,
  ease: "power1.inOut",
  repeat: -1,
  repeatDelay: 0.2,
});

// Fade out entire indicator after scrolling 15vh
ScrollTrigger.create({
  start: "top -15%",
  onEnter: () => gsap.to(".scroll-indicator", { opacity: 0, y: 10, duration: 0.4 }),
  onLeaveBack: () => gsap.to(".scroll-indicator", { opacity: 1, y: 0, duration: 0.4 }),
});
```

---

### 5.6 Navbar Behavior

**On mount:**
```ts
ScrollTrigger.create({
  start: "top -80px",
  onEnter: () =>
    gsap.to(".navbar", {
      backgroundColor: "rgba(17,17,17,0.92)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(42,42,42,0.8)",
      duration: 0.35,
      ease: "power2.out",
    }),
  onLeaveBack: () =>
    gsap.to(".navbar", {
      backgroundColor: "transparent",
      backdropFilter: "blur(0px)",
      borderBottom: "1px solid transparent",
      duration: 0.35,
    }),
});
```

**Nav link hover — underline draw:**
```css
.nav-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0%;
  height: 2px;
  background: #00B4A6;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.nav-link:hover::after { width: 100%; }
```

**Hamburger menu open/close (mobile):**
```ts
// Open: overlay slides in from right
gsap.fromTo(".mobile-menu", { xPercent: 100 }, {
  xPercent: 0,
  duration: 0.55,
  ease: "expo.out",
});
// Stagger nav link items
gsap.from(".mobile-menu .nav-item", {
  x: 60,
  opacity: 0,
  stagger: 0.07,
  duration: 0.4,
  ease: "power3.out",
  delay: 0.2,
});

// Close: reverse
gsap.to(".mobile-menu", {
  xPercent: 100,
  duration: 0.4,
  ease: "expo.in",
});
```

Hamburger icon morph (3 bars → X):
- Bar 1: `rotate(45deg) translateY(+8px)`
- Bar 2: `opacity: 0 scaleX(0)`
- Bar 3: `rotate(-45deg) translateY(-8px)`
All via CSS `transition: all 0.3s ease`.

---

### 5.7 Section Reveal — Staggered Slide Up

Every section heading follows this exact two-part pattern, **without exception**:

```ts
// 1. Eyebrow label
gsap.from(".section-eyebrow", {
  scrollTrigger: { trigger: ".section-eyebrow", start: "top 88%" },
  opacity: 0,
  y: 14,
  duration: 0.45,
  ease: "power2.out",
});

// 2. Title — split into lines, each masked
gsap.from(".section-title .line", {
  scrollTrigger: { trigger: ".section-title", start: "top 85%" },
  yPercent: 105,
  duration: 0.7,
  stagger: 0.1,
  ease: "power4.out",
});

// 3. Body paragraph
gsap.from(".section-body", {
  scrollTrigger: { trigger: ".section-body", start: "top 88%" },
  opacity: 0,
  y: 20,
  duration: 0.6,
  ease: "power3.out",
  delay: 0.15,
});
```

---

### 5.8 Stat Counters

Inspired by: nickho has large number stats (`98`, `17`, `14`) that count up on scroll.

```ts
document.querySelectorAll(".stat-number").forEach((el) => {
  const target = parseInt(el.getAttribute("data-target") || "0");
  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.fromTo(
        el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 1.6,
          ease: "power2.out",
          snap: { textContent: 1 },
          onUpdate() {
            el.textContent = Math.floor(parseFloat(el.textContent || "0")).toString();
          },
        }
      );
    },
  });
});
```

After count completes, a teal underline `2px` draws in from left → right under the number:
```ts
gsap.fromTo(".stat-underline", { scaleX: 0, transformOrigin: "left" }, {
  scaleX: 1, duration: 0.4, ease: "power2.out", delay: 1.5,
});
```

---

### 5.9 Profile Cards — Hover Micro-animations

Each card has layered hover effects (all via GSAP `mouseenter`/`mouseleave`):

```ts
card.addEventListener("mouseenter", () => {
  gsap.to(card, { y: -8, duration: 0.3, ease: "power2.out" });
  gsap.to(card.querySelector(".card-border"), {
    borderColor: "#00B4A6",
    boxShadow: "0 0 0 1px #00B4A6, 0 12px 40px rgba(0,180,166,0.15)",
    duration: 0.3,
  });
  gsap.to(card.querySelector(".card-avatar"), {
    scale: 1.05,
    duration: 0.35,
    ease: "power2.out",
  });
  gsap.to(card.querySelector(".card-cta"), {
    x: 6,
    duration: 0.3,
    ease: "power2.out",
  });
});

card.addEventListener("mouseleave", () => {
  gsap.to(card, { y: 0, duration: 0.4, ease: "power2.out" });
  gsap.to(card.querySelector(".card-border"), {
    borderColor: "#2A2A2A",
    boxShadow: "none",
    duration: 0.4,
  });
  gsap.to(card.querySelector(".card-avatar"), { scale: 1, duration: 0.4 });
  gsap.to(card.querySelector(".card-cta"), { x: 0, duration: 0.35 });
});
```

---

### 5.10 Horizontal Pinned Scroll — Journal Preview Strip

Inspired by: nickho's history section scrolls horizontally while the page scroll is consumed.

**Placement:** between the profile cards section and the about section on the landing page.

**Structure:**
```html
<section class="h-screen overflow-hidden" ref={pinRef}>
  <div class="flex w-[300vw]" ref={trackRef}>
    <!-- Panel 1: Janandra latest entry -->
    <!-- Panel 2: Akmal latest entry -->
    <!-- Panel 3: Farhan latest entry -->
    <!-- Each panel: w-screen h-screen flex items-center px-24 -->
  </div>
</section>
```

**GSAP:**
```ts
gsap.to(trackRef.current, {
  xPercent: -((100 / 3) * 2), // move 2/3 of total width
  ease: "none",
  scrollTrigger: {
    trigger: pinRef.current,
    pin: true,
    scrub: 1,
    start: "top top",
    end: "+=200%",
    snap: { snapTo: 1 / 2, duration: 0.5, ease: "power2.inOut" },
  },
});
```

**Panel content:**
- Top-left: large panel number `"01"` / `"02"` / `"03"` `Space Grotesk 800 --text-9xl opacity-5 --text-primary` (watermark)
- Profile name `Space Grotesk 700 --text-5xl --text-primary`
- Entry week badge `--accent-orange`
- Entry title `Space Grotesk 700 --text-3xl`
- 3-line excerpt `Inter 400 --text-base --text-secondary`
- `"Baca →"` teal link
- Right side: entry cover photo `aspect-[3/4]` `rounded-2xl` with inner parallax `y: "-10% → 10%"` as panel scrolls

**Progress indicator:** dots row at bottom of section, active dot fills teal, inactive dots `border border-[#2A2A2A]`. GSAP updates active state based on `scrub` progress.

---

### 5.11 Looping Marquee Ticker

Inspired by: nickho has a looping ticker strip between sections.

**Placement:** between the horizontal scroll section and the about section.

**Content:** repeating text: `"JURNAL PKL · JANANDRA · AKMAL · FARHAN · 2025 · LAPORAN MAGANG · "` — repeated 4× in a single row.

**CSS + GSAP approach:**
```ts
// Two identical rows side by side inside a flex container
// Animate both together: x from 0 → -50% (so seamless loop)
gsap.to(".ticker-track", {
  xPercent: -50,
  ease: "none",
  duration: 20,
  repeat: -1,
});
```

**Style:** `Inter 600 uppercase tracking-[0.15em] --text-xs --text-muted`. Separator `·` in `--accent-teal`. Full row height `48px`, `border-y border-[#2A2A2A]`, `bg-transparent`, `overflow-hidden`.

**Hover:** `animation-play-state: paused` — achieved by setting GSAP `timeScale(0)` on `mouseenter`, restore on `mouseleave`.

---

### 5.12 About Section — Scroll-Scrubbed Image Reveal

Inspired by: nickho's about image appears as if it's being revealed by a sliding mask.

**Implementation:**
```html
<div class="img-reveal-wrapper" style="overflow:hidden; border-radius:16px">
  <img class="img-reveal-inner" src="..." />
</div>
```

```ts
// Wrapper: clip-path starts closed, opens on scroll
gsap.fromTo(
  ".img-reveal-wrapper",
  { clipPath: "inset(0 100% 0 0)" },
  {
    clipPath: "inset(0 0% 0 0)",
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".img-reveal-wrapper",
      start: "top 75%",
      end: "top 30%",
      scrub: 0.8,
    },
  }
);

// Inner image counteracts to stay in place
gsap.fromTo(
  ".img-reveal-inner",
  { x: "30%" },
  {
    x: "0%",
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".img-reveal-wrapper",
      start: "top 75%",
      end: "top 30%",
      scrub: 0.8,
    },
  }
);
```

---

### 5.13 History / Timeline Section

Inspired by: nickho's history section with chapter headings and switching content.

**Behavior:** vertical timeline on desktop. 5 PKL week milestones (e.g., Week 1: Orientation, Week 3: First Project, Week 6: Mid-review, Week 8: Main Project, Week 10: Final Presentation).

- Left: stacked milestone titles — `Space Grotesk 700 --text-2xl`, inactive `opacity-30`, active `opacity-100 --accent-teal`.
- Right: content panel swaps based on active milestone.
- **Scroll-driven:** `ScrollTrigger` pins the section, each milestone activates as user scrolls through its "zone". `scrub: true`.

```ts
milestones.forEach((milestone, i) => {
  ScrollTrigger.create({
    trigger: `.milestone-zone-${i}`,
    start: "top 50%",
    end: "bottom 50%",
    onEnter: () => setActive(i),
    onEnterBack: () => setActive(i),
  });
});
```

Active milestone title: GSAP `opacity: 0.3 → 1`, `x: -10 → 0`, `color: --text-primary → --accent-teal`.
Content crossfade: `opacity: 0 → 1`, `y: 15 → 0`, `duration: 0.45`.

---

### 5.14 Photo Gallery — Drag Scroll

Inspired by: nickho gallery has a `"drag"` hint and supports click-drag to scroll horizontally.

**Implementation (`components/sections/GalleryGrid.tsx`):**
- Layout: horizontal strip of photos, `overflow: hidden`, no scrollbar.
- GSAP Observer for drag:
  ```ts
  Observer.create({
    target: galleryRef.current,
    type: "pointer,touch",
    onDrag: (self) => {
      gsap.to(galleryTrack.current, {
        x: `+=${self.deltaX}`,
        duration: 0,
        ease: "none",
        modifiers: {
          x: gsap.utils.unitize(
            gsap.utils.clamp(-(totalWidth - containerWidth), 0)
          ),
        },
      });
    },
    onDragEnd: (self) => {
      // momentum / inertia on release
      gsap.to(galleryTrack.current, {
        x: `+=${self.velocityX * 0.3}`,
        duration: 0.6,
        ease: "power2.out",
        modifiers: {
          x: gsap.utils.unitize(
            gsap.utils.clamp(-(totalWidth - containerWidth), 0)
          ),
        },
      });
    },
  });
  ```
- Cursor changes to `cursor-grab` normally, `cursor-grabbing` while dragging (add class to `html`).
- `"DRAG"` hint appears on gallery entry with `←→` arrows, fades after first drag or `3s` timeout.

**Photo items:**
- Size: `300px × 400px` (portrait), `gap-4`, `rounded-2xl`.
- On hover: image scales `1.04` inside container (overflow hidden), overlay `rgba(0,0,0,0.25)` fades in.
- No click for lightbox on the gallery strip — separate click opens fullscreen lightbox (Section 5.15).

---

### 5.15 Lightbox

```ts
// Open: background fades in, image scales from 0.85 → 1
gsap.fromTo(".lightbox-overlay", { opacity: 0 }, { opacity: 1, duration: 0.3 });
gsap.fromTo(".lightbox-image", { scale: 0.88, opacity: 0 }, {
  scale: 1, opacity: 1, duration: 0.4, ease: "power3.out",
});

// Navigate prev/next: current image exits xPercent: ±60 opacity 0,
// next image enters from opposite side
gsap.fromTo(".lightbox-image", { xPercent: dir * 60, opacity: 0 }, {
  xPercent: 0, opacity: 1, duration: 0.35, ease: "power3.out",
});

// Close: scale down + fade
gsap.to(".lightbox-image", { scale: 0.92, opacity: 0, duration: 0.25 });
gsap.to(".lightbox-overlay", { opacity: 0, duration: 0.3, onComplete: close });
```

Keyboard: `ArrowLeft` / `ArrowRight` to navigate, `Escape` to close. Focus trap active while open.

---

### 5.16 Magnetic Buttons (Primary CTAs)

```ts
// Mount on every element with class .btn-magnetic
document.querySelectorAll(".btn-magnetic").forEach((btn) => {
  const bound = 80; // px outside button that still activates

  btn.addEventListener("mousemove", (e: MouseEvent) => {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    gsap.to(btn, { x: dx * 0.35, y: dy * 0.25, duration: 0.4, ease: "power2.out" });
    // Inner text moves slightly more for depth
    gsap.to(btn.querySelector(".btn-label"), {
      x: dx * 0.12, y: dy * 0.1, duration: 0.4, ease: "power2.out",
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    gsap.to(btn.querySelector(".btn-label"), {
      x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)",
    });
  });
});
```

**Button click ripple:**
```ts
btn.addEventListener("click", (e: MouseEvent) => {
  const ripple = document.createElement("span");
  ripple.className = "ripple absolute rounded-full bg-white/20 pointer-events-none";
  const size = Math.max(btn.offsetWidth, btn.offsetHeight);
  const rect = btn.getBoundingClientRect();
  Object.assign(ripple.style, {
    width: `${size}px`, height: `${size}px`,
    left: `${e.clientX - rect.left - size / 2}px`,
    top: `${e.clientY - rect.top - size / 2}px`,
  });
  btn.appendChild(ripple);
  gsap.fromTo(ripple,
    { scale: 0, opacity: 1 },
    { scale: 2.5, opacity: 0, duration: 0.55, ease: "power2.out",
      onComplete: () => ripple.remove() }
  );
});
```

---

### 5.17 Page Transitions (Route Changes)

```ts
// components/animations/PageTransition.tsx
// Wrap all page content in <div class="page-wrapper">

// On route start (usePathname change detected):
gsap.to(".page-wrapper", {
  opacity: 0,
  y: -16,
  duration: 0.28,
  ease: "power2.in",
  onComplete: () => router.push(nextPath),
});

// On new page mount:
gsap.fromTo(".page-wrapper",
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", delay: 0.05 }
);
```

Supplemental: a thin `2px` teal progress bar at the top of the viewport animates `width: 0% → 100%` during navigation, then fades out.

```ts
gsap.fromTo(".nav-progress",
  { width: "0%", opacity: 1 },
  { width: "100%", duration: 0.35, ease: "power1.inOut",
    onComplete: () => gsap.to(".nav-progress", { opacity: 0, duration: 0.2 }) }
);
```

---

### 5.18 Countdown Timer (Landing Hero)

Inspired by: nickho has a live countdown `"Next race: 00:00:00:00"`.

**PKL equivalent:** show countdown to **end-of-PKL date** in the hero section.

```ts
// Format: DD : HH : MM : SS
// Update every second with setInterval
// On mount: calculate diff from endDate (from Supabase profiles.end_date of the earliest ending intern)
// GSAP flip animation each second: digit slides up and new digit comes in from below
// Each digit group: position:relative overflow:hidden height:1em
// On tick: gsap.fromTo(".digit", { y: "100%" }, { y: "0%", duration: 0.2, ease: "power2.out" })
```

Style: `JetBrains Mono 400 --text-3xl --text-primary`. Separator `":"` in `--accent-teal`. Label below `"hari · jam · menit · detik"` `Inter 400 --text-xs --text-muted tracking-widest`.

---

### 5.19 Modal / Drawer Open-Close

**Modal (Entry Detail):**
```ts
// Open
gsap.fromTo(".modal-overlay", { opacity: 0 }, { opacity: 1, duration: 0.25 });
gsap.fromTo(".modal-panel",
  { yPercent: 4, opacity: 0, scale: 0.98 },
  { yPercent: 0, opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" }
);

// Close
gsap.to(".modal-panel", { yPercent: 4, opacity: 0, scale: 0.98, duration: 0.22, ease: "power2.in" });
gsap.to(".modal-overlay", { opacity: 0, duration: 0.25, onComplete: closeModal });
```

**Drawer (Add/Edit Entry):**
```ts
// Open — slides in from right
gsap.fromTo(".drawer",
  { xPercent: 100 },
  { xPercent: 0, duration: 0.45, ease: "expo.out" }
);

// Close
gsap.to(".drawer", { xPercent: 100, duration: 0.35, ease: "expo.in" });
```

---

### 5.20 Toast Notifications

```ts
// Appears: slides in from top-right + fade
gsap.fromTo(".toast",
  { xPercent: 110, opacity: 0 },
  { xPercent: 0, opacity: 1, duration: 0.4, ease: "expo.out" }
);

// Auto-dismiss after 3s: slides back out
gsap.to(".toast", {
  xPercent: 110,
  opacity: 0,
  duration: 0.3,
  ease: "expo.in",
  delay: 3,
  onComplete: () => toast.remove(),
});
```

---

### 5.21 Journal Entry Feed — Staggered Scroll Reveal

Each entry card in the feed:
```ts
gsap.from(".entry-card", {
  scrollTrigger: {
    trigger: ".entry-card",
    start: "top 88%",
  },
  opacity: 0,
  y: 40,
  duration: 0.55,
  stagger: 0.12,
  ease: "power3.out",
});
```

Left timeline dot (if timeline layout used): scales from `0 → 1` with spring:
```ts
gsap.from(".timeline-dot", {
  scale: 0,
  duration: 0.4,
  ease: "back.out(2)",
  scrollTrigger: { trigger: ".timeline-dot", start: "top 85%" },
});
```

---

### 5.22 `prefers-reduced-motion` Guard

**All GSAP animations must be wrapped:**

```ts
// utils/motion.ts
export const motionOk = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Usage:
if (motionOk()) {
  gsap.from(el, { ... });
} else {
  gsap.set(el, { opacity: 1, y: 0, x: 0 }); // instant, no animation
}
```

Also disable: custom cursor, magnetic buttons, horizontal scroll snap (falls back to normal vertical scroll), marquee ticker (pauses), depth parallax (disables mouse tracking).

---

### 5.23 ScrollTrigger Cleanup

Every `ScrollTrigger` created inside a `useEffect` or `useGSAP` must be killed on unmount:

```ts
useEffect(() => {
  const ctx = gsap.context(() => {
    // all gsap.from/to/ScrollTrigger here
  }, containerRef);

  return () => ctx.revert(); // kills all triggers & tweens in scope
}, []);
```

Use `gsap.context()` scoping for **all** page-level animations. Never leave orphaned ScrollTriggers.

---

## 6. Supabase Schema

### 6.1 Tables

```sql
-- profiles: one per intern + super_admin
CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug          TEXT UNIQUE NOT NULL,
  full_name     TEXT NOT NULL,
  company       TEXT,
  role_title    TEXT,
  bio           TEXT,
  start_date    DATE,
  end_date      DATE,
  avatar_url    TEXT,
  cover_url     TEXT,
  role          TEXT NOT NULL DEFAULT 'intern'
                CHECK (role IN ('intern', 'super_admin')),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- journal_entries
CREATE TABLE journal_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,  -- HTML from Tiptap
  week_number   INTEGER,
  entry_date    DATE NOT NULL,
  tags          TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- entry_photos
CREATE TABLE entry_photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id      UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  profile_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,  -- path in Supabase Storage
  caption       TEXT,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- activity_log (for super-admin dashboard)
CREATE TABLE activity_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity        TEXT,  -- 'entry', 'profile', 'photo'
  entity_id     UUID,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### 6.2 Row-Level Security (RLS)

Enable RLS on all tables.

```sql
-- profiles: public read
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT TO anon, authenticated USING (true);

-- profiles: intern can only update their own row
CREATE POLICY "profiles_intern_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- profiles: super_admin can do all
CREATE POLICY "profiles_superadmin_all" ON profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- journal_entries: public read
CREATE POLICY "entries_public_read" ON journal_entries
  FOR SELECT TO anon, authenticated USING (true);

-- journal_entries: intern can only insert/update/delete their own
CREATE POLICY "entries_intern_write" ON journal_entries
  FOR ALL TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- journal_entries: super_admin can do all
CREATE POLICY "entries_superadmin_all" ON journal_entries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'super_admin'
    )
  );

-- Apply same pattern for entry_photos
-- activity_log: only super_admin reads; authenticated can insert their own
```

Enforce max 3 profiles via trigger:

```sql
CREATE OR REPLACE FUNCTION check_max_profiles()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM profiles WHERE role = 'intern') >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 intern profiles reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_profiles
  BEFORE INSERT ON profiles
  FOR EACH ROW
  WHEN (NEW.role = 'intern')
  EXECUTE FUNCTION check_max_profiles();
```

### 6.3 Storage Buckets

| Bucket | Public | Path pattern |
|---|---|---|
| `avatars` | ✅ Public | `{profile_id}/avatar.{ext}` |
| `covers` | ✅ Public | `{profile_id}/cover.{ext}` |
| `photos` | ✅ Public | `{profile_id}/{entry_id}/{filename}` |

Storage policies: allow public read; allow authenticated insert/update/delete only to their own `profile_id` prefix (or super_admin all).

### 6.4 Realtime

Enable Supabase Realtime on `journal_entries` and `entry_photos`. In the public profile page (`/profiles/[slug]`), subscribe to changes on `journal_entries` filtered by `profile_id`. When new entry is inserted or updated, update the feed in real-time without page reload using Supabase's JS client `channel().on('postgres_changes', ...)`.

---

## 7. Auth Flow Detail

### 7.1 Supabase Auth

Use `@supabase/ssr` with Next.js App Router (cookie-based sessions, server components).

### 7.2 Session Check Middleware (`middleware.ts`)

```ts
// Protected paths:
// /profiles/*/admin → require auth + (role=intern AND slug matches) OR role=super_admin
// /admin            → require auth + role=super_admin
// All other paths   → public (no redirect)
```

### 7.3 Role Resolution

After sign-in, fetch `profiles` table row where `user_id = session.user.id`. Store `role` and `slug` in a client-side context (`AuthContext`) populated from a server component.

---

## 8. Component Architecture

```
/src
  /app
    /layout.tsx              ← Root layout (fonts, GSAP init, AuthProvider)
    /page.tsx                ← Landing
    /profiles/page.tsx       ← Profile grid
    /profiles/[slug]/
      /page.tsx              ← Public journal view
      /admin/page.tsx        ← Profile admin (protected)
    /admin/page.tsx          ← Super-admin (protected)
    /login/page.tsx          ← Login
  /components
    /ui
      Button.tsx             ← Primary/secondary/danger variants
      Input.tsx
      Textarea.tsx
      Modal.tsx              ← Animated overlay modal
      Drawer.tsx             ← Right-side slide-in drawer
      Toast.tsx              ← Top-right notification
      Badge.tsx              ← Tag / pill badge
      Avatar.tsx             ← Circular avatar with border option
    /layout
      Navbar.tsx             ← Fixed nav with scroll behavior
      Footer.tsx
      Sidebar.tsx            ← Admin sidebar
    /animations
      ParallaxImage.tsx      ← GSAP scroll parallax wrapper
      RevealOnScroll.tsx     ← ScrollTrigger reveal wrapper
      CounterAnimation.tsx   ← Number counter
      MagneticButton.tsx     ← Magnetic hover button
      PageTransition.tsx     ← Route transition wrapper
    /sections
      HeroSection.tsx
      ProfileCardsSection.tsx
      AboutSection.tsx
      JournalFeed.tsx
      GalleryGrid.tsx
      Lightbox.tsx
    /admin
      EntryEditor.tsx        ← Tiptap rich text editor
      PhotoUploader.tsx      ← Drag-and-drop multi-upload
      ProfileForm.tsx
  /lib
    /supabase
      client.ts              ← Browser client
      server.ts              ← Server client
      middleware.ts          ← Auth middleware helpers
    /hooks
      useReveal.ts
      useAuth.ts
      useRealtime.ts
    /types
      index.ts               ← Profile, JournalEntry, EntryPhoto types
    /utils
      slugify.ts
      formatDate.ts
```

---

## 9. UI State & UX Micro-Details

- **Loading skeletons:** dark animated shimmer (`bg-[#1A1A1A]` with `background: linear-gradient(90deg, #1A1A1A 25%, #222 50%, #1A1A1A 75%)` animated `backgroundPosition`). Use on: entry cards, avatar, cover.
- **Empty states:** illustrated message `"Belum ada entri jurnal."` with a soft icon and `"+ Tambah Entri Pertama"` teal CTA. Only visible to the profile owner (logged in), not to public.
- **Optimistic UI on entry save:** instantly add/update the entry in local state before Supabase resolves, then reconcile or rollback on error.
- **Confirmation modal for delete:** before deleting an entry or photo, show a modal `"Yakin ingin menghapus?"` with `"Hapus"` danger button (red-bordered) and `"Batal"` grey button.
- **404 page:** full-bleed dark, large `"404"` `Space Grotesk 800 --text-9xl --accent-teal opacity-20`, text `"Halaman tidak ditemukan"` above it, `"Kembali ke Beranda"` CTA.
- **Accessibility:** all interactive elements have `aria-label`, modals trap focus, `prefers-reduced-motion` disables GSAP animations (check via `window.matchMedia`).
- **Mobile nav:** swipe-right gesture opens hamburger menu (use `touchstart`/`touchend` delta).

---

## 10. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # server-side only, never exposed to client
```

---

## 11. Dependencies to Install

```bash
npm install gsap @gsap/react
npm install @supabase/supabase-js @supabase/ssr
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder
npm install lucide-react
npm install clsx tailwind-merge
npm install date-fns
```

Tailwind config additions:

```js
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      bg: {
        primary:   "#0A0A0A",
        secondary: "#111111",
        tertiary:  "#1A1A1A",
      },
      border: "#2A2A2A",
      accent: {
        teal:       "#00B4A6",
        "teal-dim": "#007A70",
        orange:     "#F97316",
        "orange-dim":"#C05A0D",
      },
    },
    fontFamily: {
      display: ["Space Grotesk", "sans-serif"],
      body:    ["Inter", "sans-serif"],
      mono:    ["JetBrains Mono", "monospace"],
    },
  },
},
```

---

## 12. Key Implementation Notes for OpenCode

1. **GSAP must be initialized client-side only.** Wrap all GSAP calls in `useEffect` or use `@gsap/react`'s `useGSAP` hook. Never import GSAP in server components.
2. **Supabase server client** uses `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers` in Server Components and Route Handlers.
3. **Supabase browser client** is a singleton exported from `lib/supabase/client.ts`.
4. **Images:** use Next.js `<Image>` component for all static/uploaded images. Configure `remotePatterns` in `next.config.ts` for your Supabase Storage URL.
5. **Rich text content** stored as HTML string in Supabase. Render with `dangerouslySetInnerHTML` inside a `prose dark:prose-invert` Tailwind Typography wrapper. Install `@tailwindcss/typography`.
6. **No purple** anywhere in the codebase. Run a global search for `purple` before final commit.
7. **Realtime subscription cleanup:** always call `supabase.removeChannel(channel)` in the `useEffect` cleanup function.
8. **Slug validation:** slugs must match `/^[a-z0-9-]+$/`. Show inline validation error if violated.
9. **File size limits:** enforce `< 5MB` per photo client-side before upload, display clear error if exceeded.
10. **Super-admin route** `/admin` should have no `<Link>` pointing to it anywhere in the public codebase. It's accessed by direct URL only.

---

## 13. Seeded Profile Data

The three intern profiles are fixed and pre-seeded. Use these exact values when building the Supabase seed script (`supabase/seed.sql`) and any placeholder/mock UI.

### Profile 1 — Janandra

| Field | Value |
|---|---|
| `full_name` | `Janandra` |
| `slug` | `janandra` |
| `avatar placeholder` | initials `"JA"` on `bg-[#1A1A1A]` teal border |
| `cover placeholder` | dark gradient `#0A0A0A → #1A1A1A` diagonal |
| `company` | *(to be filled by Janandra via admin panel)* |
| `role_title` | *(to be filled by Janandra)* |
| `bio` | *(to be filled by Janandra)* |
| `role` | `intern` |
| Profile page URL | `/profiles/janandra` |
| Admin panel URL | `/profiles/janandra/admin` |

### Profile 2 — Akmal

| Field | Value |
|---|---|
| `full_name` | `Akmal` |
| `slug` | `akmal` |
| `avatar placeholder` | initials `"AK"` on `bg-[#1A1A1A]` teal border |
| `cover placeholder` | dark gradient `#0A0A0A → #1A1A1A` diagonal |
| `company` | *(to be filled by Akmal via admin panel)* |
| `role_title` | *(to be filled by Akmal)* |
| `bio` | *(to be filled by Akmal)* |
| `role` | `intern` |
| Profile page URL | `/profiles/akmal` |
| Admin panel URL | `/profiles/akmal/admin` |

### Profile 3 — Farhan

| Field | Value |
|---|---|
| `full_name` | `Farhan` |
| `slug` | `farhan` |
| `avatar placeholder` | initials `"FA"` on `bg-[#1A1A1A]` teal border |
| `cover placeholder` | dark gradient `#0A0A0A → #1A1A1A` diagonal |
| `company` | *(to be filled by Farhan via admin panel)* |
| `role_title` | *(to be filled by Farhan)* |
| `bio` | *(to be filled by Farhan)* |
| `role` | `intern` |
| Profile page URL | `/profiles/farhan` |
| Admin panel URL | `/profiles/farhan/admin` |

### 13.1 Seed SQL

```sql
-- Run AFTER creating Supabase Auth users manually in the dashboard
-- or via the admin API. Replace the UUIDs below with the real auth.users IDs.

INSERT INTO profiles (user_id, slug, full_name, role)
VALUES
  ('<<JANANDRA_USER_UUID>>', 'janandra', 'Janandra', 'intern'),
  ('<<AKMAL_USER_UUID>>',    'akmal',    'Akmal',    'intern'),
  ('<<FARHAN_USER_UUID>>',   'farhan',   'Farhan',   'intern');

-- Super admin (separate user, created first)
INSERT INTO profiles (user_id, slug, full_name, role)
VALUES
  ('<<SUPERADMIN_USER_UUID>>', 'admin', 'Super Admin', 'super_admin');
```

> **Note:** Create the 4 Supabase Auth users (Janandra, Akmal, Farhan, Super Admin) first via the Supabase dashboard → Authentication → Users → Invite. Then replace the UUID placeholders above with the generated `auth.users.id` values before running the seed.

### 13.2 Avatar Initials Fallback Component

When `avatar_url` is `null`, render a circular div with the user's initials:

```tsx
// components/ui/Avatar.tsx
const INITIALS_MAP: Record<string, string> = {
  janandra: "JA",
  akmal:    "AK",
  farhan:   "FA",
};

// Render: bg-[#1A1A1A] border-2 border-[--accent-teal] rounded-full
// centered text: Space Grotesk 700, size proportional to avatar size
// color: --accent-teal
```

### 13.3 Profile Card Order on Landing & `/profiles`

Always render in this fixed order: **Janandra → Akmal → Farhan** (left to right on desktop, top to bottom on mobile). Do not sort alphabetically or by `created_at`. Use an `ORDER BY CASE` in the query or a client-side sort by a `display_order` column (value: `1, 2, 3` respectively).

Add `display_order` column to the seed:

```sql
ALTER TABLE profiles ADD COLUMN display_order INTEGER DEFAULT 99;

UPDATE profiles SET display_order = 1 WHERE slug = 'janandra';
UPDATE profiles SET display_order = 2 WHERE slug = 'akmal';
UPDATE profiles SET display_order = 3 WHERE slug = 'farhan';
```
