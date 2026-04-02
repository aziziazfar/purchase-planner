# 💰 Purchase Planner

A personal purchase planning and cashflow forecasting tool. Plan upcoming purchases, track who is paying for what, organise items by phase, and visualise your spending across months — all stored locally in your browser with no backend required.

---

## Getting Started

### Prerequisites

- Node.js v18+ (tested on v22.4.0)
- npm

### Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Building for production

```bash
npm run build
npm run preview
```

The output in `dist/` is a fully static site — it can be hosted on GitHub Pages, Netlify, Vercel, or any static host with no server configuration needed.

---

## Item Schema

Every item you create has the following properties:

| Field | Type | Description |
|---|---|---|
| Name | String | Name of the item |
| Price | Number | Cost in SGD ($) |
| Planned Purchase Date | Date | When you intend to buy it — determines Timeline placement |
| Phase | Integer | Which buying phase this item belongs to (1, 2, 3…) |
| Details | String | Optional notes |
| Item Link | URL | Optional link to the product page |
| Priority | 1–5 stars | Importance rating for sorting |
| Purchased | Boolean | Whether the item has been bought |
| Paid By | Array | Which profiles contributed and how much each paid |

---

## Views

The app has four tab-based views, all reading from the same data.

### Item List

The primary overview of all your items.

- Displays all items in a sortable table with columns for Item, Phase, Planned Date, Price, and Priority
- **Sort options:** Phase, Priority (high/low), Date (soonest/latest), Price (high/low)
- **Purchased checkbox** — tick an item once bought; it automatically moves to a _Bought_ section at the bottom of the table, sorted independently
- The toolbar shows the total budget and a bought/total item count
- Each row has **Edit** and **Delete** actions

### Timeline View

A horizontal month-by-month table showing items grouped by their planned purchase date.

- Columns are auto-generated — only months that have items appear
- Each column header shows the **total cost** for that month and the **upcoming (unpurchased) cost** below it
- Items within each month are sorted by priority (highest first)
- Each card shows the item name, priority stars, price, details, and a link if available
- Horizontally scrollable when there are many months

### Phase View

A column-per-phase layout for visualising your buying sequence.

- Each phase gets its own card column
- The column header shows the **total cost** for that phase and the **upcoming cost** stacked below
- Items are listed with their name and price
- Purchased items sink to the bottom of each phase column (dimmed with strikethrough)
- Useful for understanding how much cash you need to have ready at each stage of your plan

### Contributions View

A forecasting view focused on who owes what across each phase.

- Grouped by phase, showing **Paid** and **Upcoming** amounts per phase as badges
- Each profile with contributions in a phase gets a row showing:
  - **Paid** — items already purchased, with per-item amounts and a subtotal
  - **Upcoming** — items not yet bought, with per-item amounts and a subtotal
- The toolbar shows grand totals for all paid and upcoming amounts across all phases
- Profiles with no contributions in a phase are hidden automatically

---

## Profiles & Paid By

Profiles represent the people sharing the purchases (e.g. you and a partner or housemate).

### Creating a profile

1. Open any **Add Item** or **Edit Item** modal
2. Scroll to the **Paid By** section
3. Click **+ Create a profile** (or **+ New profile** if profiles already exist)
4. Type the name and press **Add** or hit Enter

Profiles are stored separately in localStorage and persist across sessions.

### Assigning contributions

Once profiles exist, the **Paid By** section in the item modal shows each profile with an amount input. Enter how much each person is contributing towards that item. Profiles left at 0 or blank are not counted.

---

## Data Management

The **Data ▾** dropdown in the top-right header provides four options:

| Option | Description |
|---|---|
| **Save to cache** | Manually flush current state to localStorage |
| **Load from cache** | Reload data from localStorage (discards any unsaved in-memory state) |
| **Save to file** | Downloads a dated `.json` snapshot of all items and profiles |
| **Load from file** | Upload a previously saved `.json` to restore items and profiles |

### File format

Exported files follow this structure:

```json
{
  "version": 1,
  "exportedAt": "2026-04-01T12:00:00.000Z",
  "items": [...],
  "profiles": [...]
}
```

This makes it straightforward to back up, share, or migrate your data.

### Cache vs file

- **Cache (localStorage)** is automatic — every add, edit, delete, and checkbox toggle saves immediately. Use _Save to cache_ if you want an explicit checkpoint, or _Load from cache_ to roll back to the last saved state.
- **File** is a portable snapshot. Use this for backups, transferring data between devices, or sharing a plan with someone else.

> Both methods work fully on static hosts like GitHub Pages — no server required.

---

## Theme

Toggle between **dark mode** and **light mode** using the ☀️ / 🌙 button in the header. The preference is not persisted between sessions.

---

## Project Structure

```
src/
  views/
    ItemList/         # Item List tab
    Timeline/         # Timeline View tab
    Phase/            # Phase View tab
    Contributions/    # Contributions tab
  components/
    ItemModal/        # Add / Edit item modal
    StarRating/       # 1–5 star priority selector
    DataMenu/         # Save / Load dropdown
  data/
    store.js          # Items CRUD + localStorage handler
    profiles.js       # Profiles CRUD + localStorage handler
    io.js             # File export / import logic
  App.jsx
  App.css
  index.css
  main.jsx
```

---

## Tech Stack

- **React 19** — UI
- **Vite 5** — build tool (v5 required for Node 22.4 compatibility)
- **localStorage** — persistence, no backend
- **Plain CSS** — glassmorphism design using the palette `#60b2e5 · #63372c · #df7373 · #33673b · #f2e5d7`
