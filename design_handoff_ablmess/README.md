# Handoff: ABLMess — Crew Mess Management App

## Overview
ABLMess is an internal tool for managing crew mess housing: rooms/beds, booking crew into beds, hotel placement when the mess is full, and reference data (locations, ships, jabatan/roles). It has a staff-facing app (Dashboard, Requests, Bookings, Rooms, Users, Logs, Reference Data, Profile) and a crew-facing view (My Requests, Profile).

## About the Design Files
The `.dc.html` files in this bundle are **design references built in an internal HTML prototyping tool** — they show intended layout, copy, states, and interaction, not production code to copy directly. They use a proprietary templating syntax (`{{ }}`, `sc-for`, `sc-if`, `dc-import`) that only runs inside that tool — **do not try to execute these files as-is**. Read them as markup/behavior specs and **recreate the designs in the target codebase's existing stack** (React, Vue, whatever the app already uses) using its existing components, routing, and data layer. If there's no existing frontend yet, choose the framework that best fits the rest of the codebase.

## Fidelity
**High-fidelity.** Colors, spacing, typography, copy, and component states shown are final — recreate pixel-for-pixel where the target stack allows. Treat exact hex values, padding/gap numbers, and border-radii below as spec, not suggestion.

## Important: Rooms.dc.html vs Rooms v2.dc.html
Two versions of the Rooms screen are included. **`Rooms v2.dc.html` is the current/intended design — implement this one.** `Rooms.dc.html` is the earlier iteration, kept only for reference on what changed (v2 replaces the flat expandable list with a card grid, adds location filter chips, a bed-count stepper on Add Room, a visual bed-chip legend, and a "Manage beds" modal instead of inline expansion).

## Global Layout
Every staff/crew screen (except Login) uses the same shell:
- Full-height flex row: fixed 240px sidebar (`Sidebar.dc.html`) + main content area.
- Main content: `padding: 32px`, `max-width: 1152px`, centered (`margin: 0 auto`).
- Page background: `#eeedec` throughout the app.
- Page header pattern: `<h1>` 24px/700/`#2e2a29`/letter-spacing -0.01em, optional 14px `#877d78` subtitle 4px below.
- Card pattern used everywhere: `background:#ffffff; border:1px solid rgba(221,219,217,.8); border-radius:12px; box-shadow:0 1px 2px rgba(221,219,217,.4); padding:24px`.

## Design Tokens

**Colors**
- Background: `#eeedec` (app bg), `#ffffff` (cards/sidebar)
- Text: `#2e2a29` (primary/headings), `#5c5551` (body), `#877d78` (secondary/meta), `#726965` (nav idle), `#a9a19e` (tertiary/disabled)
- Borders: `#dddbd9` (default), `#c5c1be` (inputs), `#eeedec` (row dividers)
- Brand red (primary action): `#c11524` default, `#9c111d` hover, shadow `0 1px 2px rgba(193,21,36,.25)`
- Link blue: `#21508c` default, `#193d6b` hover
- Active nav / tab accent blue: `#2962ae` (active tab bg), `#f3f7cc`→ actually `#f3f7fc` (active nav bg) with `#21508c` text
- Status colors (bg / fg / ring — used as pill badges with a small dot):
  - Empty/Success/Checked-in: bg `#e3f7eb`, fg `#1c5f34`, ring `rgba(48,166,91,.3)`, dot `#30a65b`
  - Occupied/Booked/Requested (warning/amber): bg `#fcf1de`, fg `#714b09`, ring `rgba(198,131,16,.3)`, dot `#c68310`
  - Full/Cancelled (red, distinct from brand red): bg `#fae0e2`, fg `#691116`, ring `rgba(184,30,38,.3)`, dot `#b81e26`
  - Placed (secondary blue): bg `#e1ecfa`, fg `#123a68`, ring `rgba(32,102,182,.3)`, dot `#2066b6`
  - Neutral/Checked-out/Crew role: bg `#eeedec`, fg `#726965`, ring `#dddbd9`, dot `#a9a19e`
  - Admin role badge: bg `#fdf1f2`, fg `#9c111d`, ring `#f8bfc3`, dot `#e6192a`
  - GS role badge: bg `#f3f7fc`, fg `#21508c`, ring `#c5d8f1`, dot `#3075cf`
- Destructive text action (Delete/Cancel/Remove): `#691116`
- Booked bed chip fill: `#c68310`; free bed chip: white with `1.5px solid #c5c1be` border

**Typography**
- Font: Inter (400/500/600/700), fallback `ui-sans-serif, system-ui, -apple-system, sans-serif`
- Page title: 24px/700, letter-spacing -0.01em
- Card/section title: 16px/600
- Modal title: 18px/600, letter-spacing -0.01em
- Body/table text: 14px/400–500
- Meta/secondary text: 12–14px, `#877d78`
- Field labels: 12px/600, uppercase, letter-spacing .05em, `#877d78`
- Table headers: 12px/600, uppercase, letter-spacing .05em, `#877d78`, bottom border `#dddbd9`

**Spacing & Shape**
- Card padding: 24px. Card gap in grids: 16–24px.
- Border radius: 8px (inputs/buttons/small chips), 12px (cards/modals), 9999px (pills/avatars/status dots).
- Table cell padding: `14px 24px` (body), `10px 24px` (header).
- Buttons: primary `padding:8px 16px, font-size:14px, font-weight:500`; small/inline variants `padding:6px 10px, font-size:12px`.

**Components**
- Primary button: red fill (`#c11524`/hover `#9c111d`), white text, 8px radius, subtle red shadow.
- Secondary button: white fill, `1px solid #c5c1be` border, `#5c5551` text, hover `#f8f7f7` bg.
- Text/link action button (table row actions): no bg/border, colored text (`#21508c` link blue or `#691116` destructive, `#1c5f34` positive), underline on hover.
- Status pill: `padding:2px 10px; border-radius:9999px; font-size:12px; font-weight:500` + 6px dot, colors per status table above.
- Tab/filter chip group: pill-shaped buttons, active = `#2962ae` bg/white text, idle = transparent or `#f8f7f7` bg with `#726965` text.
- Inputs/selects: `border:1px solid #c5c1be; border-radius:8px; padding:8px 12px; font-size:14px`.
- Sidebar nav item: active = bg `#f3f7fc`, text `#21508c`; idle = text `#726965`, hover bg `#eeedec`.

## Screens

### Login (`Login.dc.html`)
Centered card, max-width 384px, on a diagonal gradient background (`#eeedec` → white → `#fdf1f2`). App mark: 48px red rounded-square badge with "A", "ABLMess" title, "Crew mess management" subtitle. Card: email + password fields, full-width red "Sign in" button.

### Sidebar (`Sidebar.dc.html`)
240px fixed, white, right border `#dddbd9`, sticky/full height. Header (64px): 28px red logo badge "A" + "ABLMess" wordmark. Nav: icon (16px SVG, `currentColor`) + label, one row per item; item set depends on role prop — staff role sees Dashboard/Requests/Bookings/Rooms/Users/Logs/Reference Data; crew role sees only My Requests; both always end with Profile. Footer: avatar circle with initials + name/role, "Dark mode" toggle button, "Log out" button.

### Dashboard (`Dashboard.dc.html`)
Header row: title/subtitle + 4 status count pills (empty/occupied/full/in hotels) with colored dots and counts.
Two-column grid (3fr/2fr):
- Left: "Pending Requests (N)" card — list rows (name + date range) with Book (red) / Place (secondary) buttons, "View all" link to Requests; "Crew in Outside Hotels (N)" card — simple two-line rows, "View log" link to Logs.
- Right: "Today & Tomorrow" card — check-in/out rows with action button or "Upcoming" label, footer note on more movements; "Occupancy by Location" card — per-location stacked progress bar (green/amber/red segments) + fraction label + legend.

### Requests (`Requests.dc.html`)
Single card containing a full-width table: Request #, Crew, From, To, Status (pill), Actions (Book / Place in Hotel / Cancel — only shown for "Requested" rows).

### Bookings (`Bookings.dc.html`)
Same table pattern: Booking #, Crew, Bed, From, To, Status (Booked/Checked In/Checked Out/Cancelled pills), Actions (Check In/Check Out/Cancel, contextual per status).

### Rooms v2 — **build this one** (`Rooms v2.dc.html`)
Two-column layout (360px / 1fr):
- **Add Room** card: room name input, location select, a bed-count **stepper** (− / count / +, 1–12) with a live preview line ("Will create: Bed A, Bed B, …"), red "Add Room" submit.
- **All Rooms** card: header with a bed-color legend (outlined = free, filled amber = booked); location filter chip row (All / per-location, pill style, active = blue fill); responsive card grid (`repeat(auto-fill, minmax(210px,1fr))`) — each room card shows name, "location · N beds" meta, status pill (Empty/Occupied/Full), a row of small bed-status chips (filled amber = booked, outlined = free) or "No beds yet", and a footer row with "Manage beds"/"Add beds" (blue link) + "Delete" (red link).
- **Manage beds modal**: dark blurred overlay, centered card (max-width 448px). Lists each bed with a status chip, name, state label (Booked/Free); a "Remove" link only on free beds (booked beds can't be removed — helper text explains this); footer: secondary "Add Bed" + primary "Done".
- State: bed stepper 1–12, filter selection, which room's modal is open, and per-room bed arrays (add/remove bed mutates state).

### Users (`Users.dc.html`)
Header + "Add User" button. Table: Name, Email, Type (role pill — Admin/GS/Crew, distinct palettes above), Actions (Edit / Reset Password / Delete, all inline text buttons).

### Logs (`Logs.dc.html`)
Three-tab switcher (Crew Logs / Room Logs / Hotel Placements) inside one card.
- Crew Logs: person selector + table (Request #, From, To, Request Status pill, Bed, Booking Status pill).
- Room Logs: room selector + table (Bed, Crew, From, To, Status pill).
- Hotel Placements: table (Crew, Hotel + address, From, To, Notes, Logged date).

### Reference Data (`Reference Data.dc.html`)
Three-tab switcher (Locations / Ships / Jabatan) inside one card. Each tab: inline add form (name [+ address for Locations] + red "Add" button) above a simple list with name (+ secondary address text for locations) and a "Delete" link per row.

### Profile (`Profile.dc.html`)
Max-width 448px, two stacked cards: "My Details" (first/last name grid, phone, email, Save button) and "Change Password" (current/new password, Change Password button).

### My Requests — Crew view (`My Requests.dc.html`)
Uses Sidebar with `role="crew"`. "Request a Room" card (From/To date inputs, optional comment, Submit). "History" card: table of From/To/Status pill (Requested/Booked/Placed)/Comment/Cancel action (only on Requested rows).

## Interactions & Behavior
- All primary destructive/positive actions are inline (no confirm dialogs shown in the mock) — decide with the dev team whether production needs confirmation modals for Delete/Cancel.
- Tab switchers (Logs, Reference Data) and filter chips (Rooms v2) are simple local state, no URL sync shown — consider syncing to query params in production for deep-linking/back-button support.
- Rooms v2 bed stepper clamps 1–12; "Add Room" creates beds named sequentially (Bed A, Bed B, …).
- Manage-beds modal: click on overlay or "Done" closes it; only free beds show a Remove action.
- No loading/error/empty states are designed beyond "No beds yet" — ask design for these before shipping.
- Hover states throughout: buttons/rows darken or tint slightly (see each component's `style-hover` equivalent noted above); links underline on hover.

## State Management (per screen, if replicating client-side)
- **Rooms v2**: bed stepper count, active location filter, `manageIdx` (which room's modal is open), full rooms list with nested beds (each `{name, booked}`).
- **Logs / Reference Data**: active tab.
- **Sidebar**: `active` (current nav key) and `role` (`staff` | `crew`) as props from the parent route/page.
- Real app should back all list/table data with actual API calls; the mocks use hardcoded sample data (visible directly in each file's script block).

## Assets
No external images. Single SVG icon set is inline in `Sidebar.dc.html` (path data per nav item) plus one rotate-90 chevron SVG in `Rooms.dc.html`. Google Font: Inter, loaded via `fonts.googleapis.com` — swap for the codebase's existing font-loading approach (self-hosted, etc.) if it has one.

## Files in This Bundle
- `Login.dc.html`
- `Dashboard.dc.html`
- `Requests.dc.html`
- `Bookings.dc.html`
- `Rooms.dc.html` (superseded — reference only)
- `Rooms v2.dc.html` (**build this version**)
- `Users.dc.html`
- `Logs.dc.html`
- `Reference Data.dc.html`
- `Profile.dc.html`
- `My Requests.dc.html` (crew-facing)
- `Sidebar.dc.html` (shared shell, imported by every screen above)
