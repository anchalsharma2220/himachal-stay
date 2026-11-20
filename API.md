# API Documentation

Base URL: `http://localhost:5000/api` · JSON requests/responses · Auth header: `Authorization: Bearer <token>`.
Errors: `{ "success": false, "message": "..." }` with status 400 (validation), 401 (not logged in), 403 (wrong role), 404, 409 (duplicate).
Lists use `{ data: [...] }`; paginated listing search adds `total, page, pages`.

## Auth
| Method | Path | Access | Body / notes |
|---|---|---|---|
| POST | /auth/register | public | `name, email, password(min 6), phone, role: "student"\|"owner"` -> `{token, user}` |
| POST | /auth/login | public | `email, password` -> `{token, user}` |
| GET | /auth/me | any user | current user |
| PUT | /auth/me | any user | `name, phone, district, address, organization` |
| PUT | /auth/me/password | any user | `currentPassword, newPassword` |

## Properties (PGs / Rooms)
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | /pgs | public | Approved listings. Query: `district, propertyType (PG\|Room), gender, roomType, minRent, maxRent, facilities (comma list), available=true, search, sort (popular\|priceLow\|priceHigh\|newest), page, limit` |
| GET | /pgs/featured | public | `limit` |
| GET | /pgs/public-stats | public | totals + per-district counts and starting rent |
| GET | /pgs/:id | public (approved) / owner / admin | full details incl. rooms and owner contact |
| GET | /pgs/mine | owner | own listings with pending request counts |
| GET | /pgs/admin/all | admin | `status, district, search` |
| POST | /pgs | owner, admin | `name, district, location, address, description(>=20), propertyType, gender, facilities[], rules, nearby, contactPhone, images[] (URLs), rooms[{type, rent, capacity, totalUnits, available}]`. Owner listings start `pending`; admin listings are `approved` |
| PUT | /pgs/:id | owning owner, admin | same fields as above (rooms are managed separately) |
| DELETE | /pgs/:id | owning owner, admin | also deletes its bookings |
| PATCH | /pgs/:id/status | admin | `status: pending\|approved\|rejected`, `featured: boolean` |
| POST | /pgs/:id/images | owning owner, admin | multipart field `images` (JPG/PNG/WEBP, <=5 MB, max 8 per listing) |
| DELETE | /pgs/:id/images | owning owner, admin | body `{ url }` |
| POST | /pgs/:id/rooms | owning owner, admin | `type (Single\|Double\|Triple\|Four Sharing), rent, capacity, totalUnits, available` |
| PUT | /pgs/:id/rooms/:roomId | owning owner, admin | partial update; `available: 0` marks it not available |
| DELETE | /pgs/:id/rooms/:roomId | owning owner, admin | blocked while it has pending/approved bookings |

## Bookings
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | /bookings | student | `pgId, roomId, moveInDate, durationMonths (1-24), message` |
| GET | /bookings/my | student | own bookings |
| GET | /bookings/owner | owner | requests for own properties, `?status=` |
| GET | /bookings | admin | all, `?status=` |
| PATCH | /bookings/:id/cancel | student (own) | pending only |
| PATCH | /bookings/:id/status | owner, admin | `status, ownerNote`. Owner: Pending -> Approved/Rejected, Approved -> Rejected. Admin: any. Approve decrements vacancy; leaving Approved restores it |
| DELETE | /bookings/:id | admin | |

## Favourites (student)
`GET /favorites` · `POST /favorites/:pgId` (toggle; returns `isFavorite, favorites[]`)

## Users (admin)
`GET /users?role=&search=` · `POST /users` · `PUT /users/:id` (`name, phone, role, isActive, password...`) · `DELETE /users/:id`
(deleting an owner removes their listings and bookings; admins cannot delete or deactivate themselves)

## Stats (dashboards)
`GET /stats/admin` · `GET /stats/owner` · `GET /stats/student` - counts, booking status breakdown, 6-month trend,
listings per district, recent bookings and activity, all computed live from MongoDB.

## Contact
`POST /contact` (public: `name, email, subject, message`) · `GET /contact`, `PATCH /contact/:id/read`, `DELETE /contact/:id` (admin)

## Misc
`GET /health` · static uploads at `/uploads/<file>`
