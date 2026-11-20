# PG & Room Rental Management System - Himachal Pradesh (MERN)

A full-stack MERN application for finding and managing PGs and rental rooms across all **12 districts of Himachal Pradesh**
(Bilaspur, Chamba, Hamirpur, Kangra, Kinnaur, Kullu, Lahaul & Spiti, Mandi, Shimla, Sirmaur, Solan, Una).

* **Frontend:** React 18 + Vite, React Router, Axios, plain CSS (blue/white theme, responsive)
* **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, multer (image upload), helmet, rate limiting
* **Database:** MongoDB
* **Roles:** Student/Tenant, PG Owner, Admin (role-based access on both API and UI)

## Folder structure
```
pg-rental-himachal/
├── backend/
│   ├── server.js                 # entry point (connects DB, optional auto-seed)
│   ├── .env.example
│   ├── uploads/                  # uploaded property images
│   └── src/
│       ├── app.js                # express app, middleware, routes
│       ├── config/               # db connection, constants (districts, facilities)
│       ├── models/               # User, PG (with rooms), Booking, Activity, Contact
│       ├── controllers/          # auth, user, pg, booking, favorite, stats, contact
│       ├── routes/
│       ├── middleware/           # auth (JWT + roles), error, sanitize, upload
│       ├── seed/                 # demo data for all 12 districts
│       └── services.js           # room-vacancy bookkeeping
├── frontend/
│   ├── index.html, vite.config.js, .env.example
│   └── src/
│       ├── App.jsx, main.jsx, api.js, hooks.js, constants.js, styles.css
│       ├── context/              # AuthContext, ToastContext
│       ├── components/           # Navbar, Footer, PGCard, DashboardLayout, ProtectedRoute, ui ...
│       └── pages/                # Home, Listings, PGDetails, About, Contact, Login, Register
│           ├── student/          # overview, my bookings, favourites
│           ├── owner/            # overview, my PGs, PG form, manage rooms, booking requests
│           └── admin/            # overview, users, listings, bookings, messages
├── API.md                        # API documentation
└── README.md
```

## Prerequisites
* Node.js 18 or newer (`node -v`)
* MongoDB - either
  * **Local:** install MongoDB Community Server and make sure `mongod` is running (default `mongodb://127.0.0.1:27017`), or
  * **Cloud:** create a free MongoDB Atlas cluster, allow your IP and copy the connection string.

## Installation & running

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
```
Edit `.env`:
* `MONGO_URI` - local `mongodb://127.0.0.1:27017/himachal_pg` or your Atlas URI
  (e.g. `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/himachal_pg`)
* `JWT_SECRET` - set any long random string

Then start the API:
```bash
npm run dev      # or: npm start
```
The database and collections are created automatically. With `AUTO_SEED=true` (default in `.env.example`) the demo data
is inserted the first time the server starts on an empty database. To reset the demo data at any time run `npm run seed`
(this **wipes** all collections first).

API: http://localhost:5000/api  ·  health check: http://localhost:5000/api/health

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. In development Vite proxies `/api` and `/uploads` to `http://localhost:5000`, so no frontend
`.env` is required. For a production build (`npm run build`) serve `frontend/dist` and set `VITE_API_URL` (e.g.
`https://api.example.com/api`) and `VITE_API_ORIGIN` (e.g. `https://api.example.com`) before building; also set `CLIENT_URL`
in the backend `.env` to your frontend origin (CORS).

## Demo accounts (created by the seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@himachalstay.com | Admin@123 |
| PG Owner | owner1@himachalstay.com / owner2@... / owner3@... | Owner@123 |
| Student/Tenant | student1@himachalstay.com / student2@... / student3@... | Student@123 |

The login page has one-click buttons that fill these in.

## Demo data
36 approved listings (3 per district: a Boys PG, a Girls PG and a Rooms listing) with rooms, rent, capacity, vacancies,
amenities and images, plus 1 pending listing (to try admin approval), 9 sample bookings in all four statuses, favourites,
activity log entries and contact messages. Owners and listings are fictional demo data. Listing photos load from Unsplash
URLs; if an image cannot load, a placeholder is shown.

## How the main flows work
* **Student:** register -> search with filters -> open a listing -> *Book Now* on an available room type -> track the
  request under *My Bookings* (pending ones can be cancelled) -> save favourites with the heart button.
* **Owner:** register as *PG Owner* -> *Add PG* (details, facilities, rooms and rent, image upload or URLs) -> listing is
  `pending` until an admin approves it -> *Manage Rooms* (rent, capacity, units, availability) -> *Booking Requests*
  (approve / reject with note). Approving a booking reduces the room's vacancy; rejecting an approved one restores it.
* **Admin:** dashboard statistics are computed from the database; manage users (create, edit, activate/deactivate, delete),
  approve / reject / feature / edit / delete listings, change or delete any booking, read contact messages.

## Security notes
JWT bearer auth, bcrypt password hashing (cost 10), role checks on every protected route, ownership checks on listings and
bookings, input whitelisting, Mongoose validation, NoSQL-operator stripping, helmet, rate limiting on auth and contact,
image type/size limits. Change `JWT_SECRET` before deploying and do not commit `.env`.

## Troubleshooting
* *"Cannot reach the server"* - the backend is not running or `MONGO_URI` is wrong (the backend exits on a failed DB connection).
* *`MongooseServerSelectionError`* - MongoDB is not running, or Atlas IP access list does not include your IP.
* *Port in use* - change `PORT` in `backend/.env` and the proxy target in `frontend/vite.config.js`.
