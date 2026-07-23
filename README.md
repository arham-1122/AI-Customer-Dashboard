# Customer Management Dashboard with AI Insights

A full-stack, portfolio-ready CRM dashboard where teams manage customers, track notes, and get AI-generated summaries, follow-up recommendations, and sentiment analysis on customer interactions.

**Stack:** React + Tailwind CSS (frontend) · Node.js + Express (backend) · MongoDB + Mongoose (database) · JWT auth · Google Gemini API (AI features) · Recharts (analytics)

---

## 1. Project Structure

```
customer-dashboard/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── services/
│       └── layouts/
└── server/          # Express backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    ├── services/
    ├── config/
    └── utils/
```

---

## 2. Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - Local MongoDB (`mongodb://127.0.0.1:27017`), or
  - A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Google Gemini API key](https://aistudio.google.com/apikey) for the AI features (summarization, follow-up, sentiment)

---

## 3. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your values:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/customer-dashboard
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```

Seed the database with a demo user + 20 sample customers:

```bash
npm run seed
```

This creates:
- **Demo login:** `demo@dashboard.com` / `password123`
- 20 customers with realistic notes, spread across Active/Inactive statuses

Start the API server:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start        # plain node
```

The API runs at `http://localhost:5000/api` (health check at `/api/health`).

---

## 4. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env` if your API isn't on the default port:

```
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:5173`, and log in with the demo credentials above (or register a new account).

---

## 5. API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET | `/api/auth/profile` | Get current user (protected) |

### Customers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers?search=&status=&sort=&page=&limit=` | List customers (search/filter/sort/paginate) |
| GET | `/api/customers/:id` | Get one customer |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |
| POST | `/api/customers/:id/notes` | Add a note |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Stats + chart data |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/summarize/:id` | Summarize a customer's notes |
| POST | `/api/ai/follow-up/:id` | Suggest the next best action |
| POST | `/api/ai/sentiment/:id` | Classify sentiment + confidence |

All routes except `/register` and `/login` require an `Authorization: Bearer <token>` header.

---

## 6. Excel Import & Export Module

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/customers/import/preview` | Upload a file (multipart, field name `file`); parses + validates rows, no DB writes |
| POST | `/api/customers/import` | Commits the valid rows returned by `/preview`; bulk-inserts and logs import history |
| GET | `/api/customers/export?status=&search=` | Downloads an `.xlsx` of customers (optionally filtered by status or search term) |
| GET | `/api/import-history` | Lists all past imports (file name, date, imported by, record counts) |

**Import workflow:** the frontend uploads the file to `/preview` first. That endpoint parses the workbook, validates every row (required fields, email format, phone format, status must be Active/Inactive), and flags duplicate emails — both against existing customers and repeats within the same file — without writing anything to the database yet. The user reviews this in a preview table with a validation-errors breakdown, then confirms. Only the rows marked `valid` are then sent (as JSON, not the raw file) to `/import`, which re-validates server-side, bulk-inserts via `insertMany`, and writes an `ImportHistory` record used by the Import History page and the dashboard's Import widgets.

**Expected spreadsheet columns:** `Full Name`, `Email`, `Phone`, `Company`, `Status`, `Notes`. A few header variants (e.g. "Name", "Email Address") are also recognized. `Status` defaults to `Active` if left blank.

**Export options:** All Customers, Active only, Inactive only, or the current search results from the Customers page — each downloads a `customers.xlsx` file with Full Name, Email, Phone, Company, Status, Notes, and Created Date columns.

---

## 7. Deployment

### Backend → Render
1. Push this repo to GitHub.
2. Create a new **Web Service** on [Render](https://render.com), pointing at the `server/` directory.
3. Build command: `npm install` · Start command: `npm start`
4. Add environment variables from `.env` in Render's dashboard (use a MongoDB Atlas URI for `MONGO_URI`).

### Frontend → Vercel
1. Import the repo on [Vercel](https://vercel.com), set the root directory to `client/`.
2. Framework preset: **Vite**.
3. Add environment variable `VITE_API_URL` pointing to your deployed Render backend, e.g. `https://your-api.onrender.com/api`.
4. Deploy.

Update the backend's `CLIENT_URL` env var to your deployed Vercel URL so CORS allows it.

---

## 8. Notes on the AI Module

The three AI features (Summary, Follow-Up, Sentiment) call Google's Gemini API server-side (`server/services/aiService.js`) via the `@google/genai` SDK, so your API key never reaches the browser. Sentiment analysis uses Gemini's structured JSON output (`responseSchema`) so the label/confidence are always returned in a predictable shape. Results are cached on the customer document (`aiSummary`, `aiFollowUp`, `aiSentiment`) so you aren't re-billed every time you view a profile — clicking the button again regenerates and overwrites them.

Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), paste it into `GEMINI_API_KEY` in `server/.env`, and the AI buttons on the customer detail page will work immediately — no other code changes needed.

To swap in a different model provider (e.g. OpenAI) instead of Gemini, replace the client instantiation and `generateContent` calls in `aiService.js` with the equivalent SDK calls; the controller and routes don't need to change.
