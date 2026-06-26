# Brand assets

Drop logo and identity files here. The web app references them by exact path —
naming matters.

## Required files

| Filename | Purpose | Dimensions / format |
|---|---|---|
| `logo-full.svg` | Header wordmark + footer | SVG, ~140 × 32, viewBox lock |
| `logo-mark.svg` | Monogram (`G.`) for favicons, sidebar chips, social avatars | SVG, square viewBox, ~48 × 48 |
| `logo-full-inverse.svg` | Wordmark on dark / teal backgrounds | SVG, white fill |
| `og-image.png` | Default social-share card | 1200 × 630, PNG, < 200 KB |
| `og-image-square.png` | Twitter/X summary card | 1200 × 1200, PNG |
| `favicon.ico` | Browser tab icon | 32 × 32 + 16 × 16 multi-resolution |
| `apple-touch-icon.png` | iOS home-screen icon | 180 × 180, PNG, no transparency |
| `icon-192.png` | PWA manifest icon | 192 × 192, PNG |
| `icon-512.png` | PWA manifest icon (maskable-safe) | 512 × 512, PNG, 10% safe padding |

`favicon.ico`, `apple-touch-icon.png`, and the PWA icons additionally live at
`apps/web/public/` (root) so browsers find them at the conventional paths.

## Where they're consumed

Once you drop the files, swap the `G.` text placeholders in these files for
`<Image>` references:

- `apps/web/src/components/marketing/MarketingHeader.tsx` — `G.` chip + GITSOLS wordmark
- `apps/web/src/components/marketing/MarketingFooter.tsx` — `G.` chip + GITSOLS wordmark
- `apps/web/src/components/layout/AdminSidebar.tsx` — `G.` chip in admin
- `apps/web/src/components/auth/AuthShell.tsx` — `G.` chip on sign-in panel
- `apps/web/src/app/layout.tsx` — `metadata.icons` + OG defaults
- `apps/web/src/app/(marketing)/page.tsx` — header hero (no logo image needed today)

## Color rules

- Use `--primary` (`#0F4C4C` Deep Teal) for marks on light backgrounds.
- Use white for marks on dark / teal backgrounds (`logo-full-inverse.svg`).
- Do not introduce a third brand color in the mark — Signal Teal `#14B8A6`
  stays reserved for action / live / approved UI states.
