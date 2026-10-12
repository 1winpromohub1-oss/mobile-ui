# Mobile UI — Mobile-First Base Architecture

> The app itself is branded **Meesho** (`APP.name` in `js/config.js`); the
> folder and the architecture keep the generic `mobile-ui` name. See
> [Branding](#branding) for what that touches.

A dependency-free, no-build UI base (plain HTML + CSS + vanilla JS
modules) designed to run and look great on any screen — phones first,
then scaling up to tablets and desktops. No backend, no database:
this is a UI-only starting point with 3 pages.

## How to run it

You don't need Node.js or any build tool for this base. Pick one:

**Option A — VS Code Live Server (recommended)**
1. Install the "Live Server" extension in VS Code.
2. Right-click `index.html` → "Open with Live Server".
3. It opens in your browser with auto-reload on save.

**Option B — Just open the file (limited)**
- Double-click `index.html`. The markup and CSS load, but the whole app
  shell (header + brand logo, nav, footer) is built by ES modules
  (`<script type="module">`), and browsers refuse to load module scripts
  from a `file://` origin. So the page renders without any chrome — use
  Option A (Live Server) to see the real thing.

**Option C — Any static server**
If you later install a static-server tool, you can serve the folder, e.g.:
```powershell
cd mobile-ui
npx serve .          # requires Node.js (not installed on this machine yet)
# or, if you install real Python (not the Microsoft Store stub):
python -m http.server 5500
```
Note: on this machine `python` currently resolves to the Microsoft Store
stub, which cannot run `http.server`. Use Option A (Live Server) instead.

### Testing on your real phone
1. Make sure your phone and PC are on the same Wi-Fi.
2. Find your PC's LAN IP: `ipconfig` (look for IPv4 Address).
3. Start Live Server (see Option A) — it binds to your LAN IP too.
4. On your phone's browser, go to `http://<your-pc-ip>:5500`
   (Live Server's default port is 5500; adjust to whatever it prints).

## Project structure

```
mobile-ui/
├─ index.html              # Page 1 — Home
├─ pages/
│  ├─ about.html            # Page 2 — About
│  └─ contact.html          # Page 3 — Contact (form UI, no backend)
├─ css/
│  ├─ reset.css              # browser default normalization
│  ├─ variables.css          # design tokens: colors, spacing, type, radii
│  ├─ base.css                # global element styles/typography
│  ├─ layout.css              # app shell: header, main, bottom nav, footer
│  ├─ components.css          # buttons, cards, nav, forms, search, hero
│  └─ responsive.css          # mobile-first breakpoints (480/768/1024px)
├─ js/
│  ├─ theme-init.js           # no-flash theme bootstrap (runs in <head>)
│  ├─ main.js                 # entry point — assembles the shell
│  ├─ config.js               # app name + NAV_ITEMS, HEADER_MENU, SEARCH, CATEGORIES, SPIN_WHEEL
│  ├─ router.js                # detects current page, marks active nav item
│  ├─ components/
│  │  ├─ header.js             # top app bar: logo, search, menus
│  │  ├─ bottomNav.js           # mobile bottom navigation
│  │  ├─ footer.js              # content footer
│  │  ├─ themeToggle.js          # light/dark theme toggle (persisted)
│  │  └─ spinWheel.js             # Spin & Win promo wheel (home hero overlay)
│  ├─ pages/
│  │  ├─ contact.js              # page-specific behavior (form demo)
│  │  └─ home.js                 # home page behavior (mounts the wheel)
│  └─ utils/
│     └─ dom.js                   # tiny DOM helpers (qs, el, on, mount)
├─ assets/
│  ├─ main.png                  # home hero banner + Spin & Win backdrop (1920x532)
│  ├─ 1744698265981.webp         # earlier Meesho Gold artwork (unused)
│  └─ icons/
│     ├─ meeshoLogo.svg          # brand wordmark shown in the header
│     └─ favicon.svg             # square Meesho app icon (favicon + PWA)
├─ manifest.webmanifest          # installable "app-like" metadata
└─ README.md
```

## What makes it mobile-responsive

- **Viewport meta**: `width=device-width, initial-scale=1, viewport-fit=cover`
- **App shell**: sticky two-row header (brand/search/account bar + category
  strip) + scrollable content + fixed bottom nav on phones; at `768px+` the
  bottom nav is hidden and the header gains its search field and account
  links.
  The bottom-nav clearance lives on `.app` (not `.app-main`), so the footer
  is never covered by the bottom nav.
- **Safe-area insets**: padding respects notches / home indicator via
  `env(safe-area-inset-*)`
- **`100dvh`**: avoids the mobile browser URL-bar height jump
- **Fluid type**: `clamp()`-based font sizes scale smoothly with viewport
- **Touch targets**: buttons, nav items, and inputs are all ≥44px
- **Scrollable category row**: `overflow-x: auto` plus `scroll-snap` chips,
  so any number of categories fits without wrapping or breaking the layout
  on small screens. The scrollbar is hidden on purpose — the chip clipped at
  the edge is the affordance — and the chips are text-only, highlighting in
  the theme color on hover/focus
- **`font-size: 16px+` on inputs**: prevents iOS Safari auto-zoom on focus
- **Installable**: `manifest.webmanifest` + theme-color meta tag
- **No flash of the wrong theme**: `js/theme-init.js` (a classic script in
  `<head>`) applies the stored or OS-preferred theme while the document is
  still parsing, so dark-mode users never see a white flash.

## How to add a new page

1. Copy `pages/about.html` to `pages/yourpage.html`.
2. Replace the `<main>` content with your page's content.
3. Register it in `js/config.js`:
   ```js
   export const NAV_ITEMS = [
     ...,
     { id: "yourpage", label: "Your Page", href: "pages/yourpage.html", icon: "⭐" },
   ];
   ```
4. The mobile bottom nav picks it up automatically.

## Header menu, search, and categories

The top bar is data-driven, all from `js/config.js`:

- `HEADER_MENU` — the Meesho-style account links (Profile, Cart) in row 1,
  shown from md+ only. Each entry is `{ id, label, href, icon }`.
- `SEARCH` — the search field's placeholder and its accessible label (md+).
- `CATEGORIES` — the product category strip that is row 2, visible at every
  screen size. It is a horizontally scrollable list, so adding a category is
  a one-line change and the row scrolls to fit.

Only the search field and the account links are md+; phones keep their slim
first row plus the bottom nav, and always get the category row. The search
is UI-only for now — `js/components/header.js` intercepts the submit, so
nothing is sent anywhere — and the links and categories point at `"#"` until
you add real pages for them.

Header sizes come from `css/variables.css`: `--bar-height` (row 1) and
`--subbar-height` (the category row).

## Spin & Win (home hero promo)

The wheel in the third of the home banner's four parts is a self-contained
promo component:
`js/components/spinWheel.js` draws it, and `js/pages/home.js` mounts it into
the `#hero-spin` slot inside the hero `<section>`. Nothing is added to the
shared shell, so the other pages never load it.

It is laid **over** the artwork rather than beside it. `.hero` is a four-column
grid, so the banner reads as four equal parts: the artwork spans all four
(`.hero__img`), the wheel takes the third (`.spin-win`) and the result line
takes the fourth (`.spin-win__result`). Part 3 is exactly where the artwork
turns into a flat plate (measured at 49% of its width), so nothing is cropped
and nothing is covered. The `#hero-spin` slot is `display: contents`, which is
what lets the wheel and its result line be real grid items. Every slice is
filled by its own product photo from `assets/`, and a prize with no artwork
(the ₹200 slice) draws its amount on the slice instead. The wheel sizes
itself from `--spin-size`, which `css/responsive.css` steps up at
480/768/1024px while staying inside its part and clear of the artwork.

- **Prizes are data, not markup**: edit `SPIN_WHEEL.prizes` in `js/config.js`.
  Each entry is one equal slice: give it an `img` (a product photo in
  `assets/` that fills its slice), the `bg` slice colour and the `result`
  sentence. Leave `img` out and the slice shows its `label` on the wedge
  instead, in `text` (that is the ₹200 slice). Every slice wins, and the odds
  follow the array itself, so listing a prize twice doubles its chance.
- **One timer**: `SPIN_WHEEL.spinMs` is written into the wheel's
  `--spin-duration`, so the animation and the result callback can never
  disagree. `spin()` solves the landing angle for the slice it picked instead
  of guessing, so the announced prize always matches the label the pointer is
  resting on.
- **Small screens**: the wheel is capped by its own part (a quarter of the
  banner) and by the artwork boundary at 49%, so phones get a smaller wheel and
  wider screens a bigger one - 80-116px, then 180px, then 236px. The prizes stay
  available to assistive tech through a visually hidden list, and the result is
  announced by a
  `role="status"` badge in the fourth part, beside the wheel, at every size
  (the copy stays short so it fits a quarter of a phone banner).
- **UI-only**, like the contact form: a spin is random and local, logs to the
  console, and issues no coupon. There is a `TODO` in `spinWheel.js` where a
  real claim request would go.

## How to restyle the whole app

Everything themeable lives in `css/variables.css` (colors, spacing,
radii, shadows, font sizes). Change a value there and it propagates
everywhere. A dark theme is already defined under `[data-theme="dark"]`
and toggled by the moon/sun icon button in the header.

## Branding

The header brand is an image now, not text: `APP.brandLogo` in
`js/config.js` points at `assets/icons/meeshoLogo.svg`, a 156x36 wordmark
that `css/layout.css` renders at a fixed height (`width: auto` keeps the
aspect ratio, and the dark theme flips it to solid white because the
artwork's `#570D48` is unreadable on the dark surface). Swap that file, or
point the token at any other SVG, to rebrand the header.

`APP.name` drives the page titles, the header link's accessible name, and
the footer copyright; `APP.shortName` mirrors the manifest. The square
`assets/icons/favicon.svg` is the same "m" mark used for the favicon and the
installable app icon, and it is deliberately a separate square tile - a
156x36 wordmark is illegible at favicon size.

The Meesho palette lives in `css/variables.css` (brand purple `#570d48`,
switching to pink `#ff7bc3` in the dark theme), so buttons, links, badges,
the active nav item, and focus rings all follow the brand automatically.

## Scaling this up later

This base is intentionally framework-free so it runs without installing
anything. When you're ready to grow it:

- **Add a backend**: create a `server/` folder (Express + MongoDB) and
  point `js/pages/contact.js`'s `fetch()` TODO at your new API — the
  UI code is already structured to make that a small change.
- **Migrate to React**: the `css/` folder can be reused as-is. Each
  `js/components/*.js` file maps almost 1:1 to a future React component
  (`Header.jsx`, `BottomNav.jsx`, `Footer.jsx`, `ThemeToggle.jsx`).
  `config.js`'s `NAV_ITEMS` becomes the data source for a `<Route>` list.
- **Add a build step**: introduce Vite once Node.js is installed, and
  this same folder structure drops in with minimal changes.
#   m o b i l e - u i  
 