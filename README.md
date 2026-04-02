# 💰 Purchase Planner

A household purchase planning and cashflow forecasting tool. Plan upcoming purchases, track who is paying for what, organise items by phase, and visualise your spending across months — synced in real time across devices via Firebase Firestore.

---

## Getting Started

### Prerequisites

- Node.js v18+ (tested on v22.4.0)
- npm
- A [Firebase](https://console.firebase.google.com) project with Firestore enabled

### Firebase setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project
2. In the project, go to **Firestore Database → Create database** — choose **Start in test mode**
3. Go to **Project Settings → Your apps → Add app (Web)** and copy the config values
4. Go to **Firestore Database → Rules** and paste the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true;
    }
  }
}
```

### Environment variables

Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`.env` is gitignored and never committed.

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

---

## Rooms

The app is organised around **rooms** — a shared workspace identified by a short room ID (e.g. `HOME42`).

### Creating a room

1. Open the app — you'll land on the home screen
2. Leave the room ID blank and click **Create Room** to auto-generate an ID, or type your own first
3. You'll be taken to `#/YOURROOMID`

### Joining a room

1. Open the app
2. Enter the room ID your household is using
3. Click **Join Room**

### Sharing

Once inside a room, both devices see the same data in real time. Share the URL directly (`purchase-planner/#/YOURROOMID`) or just tell the other person the room ID.

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

Profiles are stored in Firestore alongside items and sync across devices.

### Assigning contributions

Once profiles exist, the **Paid By** section in the item modal shows each profile with an amount input. Enter how much each person is contributing towards that item. Profiles left at 0 or blank are not counted.

---

## Data Management

The **Data ▾** dropdown in the top-right header provides two file options:

| Option | Description |
|---|---|
| **Save to file** | Downloads a dated `.json` snapshot of all items and profiles |
| **Load from file** | Upload a previously saved `.json` to restore items and profiles into the current room |

### Migrating from a previous version

If you have data from a localStorage-based version of the app:

1. On the old version, go to **Data ▾ → Save to file** to export a `.json`
2. Create a new room on this version
3. Go to **Data ▾ → Load from file** and select the exported file — it will be pushed to Firestore

### File format

```json
{
  "version": 1,
  "exportedAt": "2026-04-01T12:00:00.000Z",
  "items": [...],
  "profiles": [...]
}
```

---

## Theme

Toggle between **dark mode** and **light mode** using the ☀️ / 🌙 button in the header. The preference is not persisted between sessions.

---

## Deploying to GitHub Pages

The repo includes a GitHub Actions workflow that builds and deploys to GitHub Pages on every push to `main`.

You must add your Firebase config as repository secrets before deploying:

1. Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**
2. Add each of the following:

| Secret name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | your API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | your sender ID |
| `VITE_FIREBASE_APP_ID` | your app ID |

Then push to `main` — the workflow will build with the secrets injected and deploy automatically.

---

## Project Structure

```
src/
  views/
    Landing/         # Room create / join screen
    ItemList/        # Item List tab
    Timeline/        # Timeline View tab
    Phase/           # Phase View tab
    Contributions/   # Contributions tab
  components/
    ItemModal/       # Add / Edit item modal
    StarRating/      # 1–5 star priority selector
    DataMenu/        # Save / Load dropdown
  data/
    firebase.js      # Firebase app initialisation (reads from .env)
    firestore.js     # Firestore helpers: roomExists, createRoom, listenToRoom, saveRoom
    store.js         # Item CRUD helpers
    profiles.js      # Profile CRUD helpers
    io.js            # File export / import logic
  App.jsx
  App.css
  index.css
  main.jsx
```

---

## Tech Stack

- **React 19** — UI
- **Vite 5** — build tool (v5 required for Node 22.4 compatibility)
- **Firebase Firestore** — real-time sync across devices
- **React Router DOM v7** — `HashRouter` for GitHub Pages compatibility
- **Plain CSS** — glassmorphism design using the palette `#60b2e5 · #63372c · #df7373 · #33673b · #f2e5d7`
