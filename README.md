# Chirpy

Chirpy is a JSON REST API built with TypeScript, allowing users to create accounts, authenticate, and post short text messages.

This is the starter code used in Boot.dev's [Learn HTTP Servers in TypeScript](https://www.boot.dev/courses/learn-http-servers-typescript) course.

---

## Requirements

- Node.js 20+
- PostgreSQL

---

## Installation

1. Clone the Repository

2. Install dependencies:
```bash
npm install
```

3. Build dependencies:
```bash
npm run build
```

4. Install PostgreSQL:  
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

5. Configure PostgreSQL:
```bash
sudo service postgresql start
sudo -u postgres psql
```

Inside the psql shell:
```sql
CREATE DATABASE chirpy;
ALTER USER postgres PASSWORD 'postgres';
\q
```

6. Create a `.env` file in the project root:
```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/chirpy?sslmode=disable
JWT_SECRET=<jwt_secret>
POLKA_KEY=<polka_api_key>
```

For `<jwt_secret>`, generate a random string key with:
```bash
openssl rand -base64 64
```

For `<polka_api_key>`, you can use any random string. Example (for Boot.Dev endpoint test):
```
f271c81ff7084ee5b99a5091b42d486e
```

7. Run migrations:
```bash
npm run migrate
```

---

## Usage

Run chirpy:
```bash
npm start
```

The API will start on http://localhost:8080

### Example Session

#### Health check:
```bash
curl http://localhost:8080/api/healthz/
```

Output:
```bash
OK
```

#### Reset the server:
```bash
curl -X POST http://localhost:8080/admin/reset
```

Output:
```text
Hits reset to 0
```

#### Create a user:
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"walt@breakingbad.com","password":"123456"}'
```

Output:
```json
{
  "id":"93c81cc8-110f-4f22-a481-4d110333f1fc",  
  "createdAt":"2025-11-10T21:11:07.272Z",
  "updatedAt":"2025-11-10T21:11:07.272Z",
  "email":"walt@breakingbad.com",
  "isChirpyRed":false
}
```

#### Login:
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"walt@breakingbad.com","password":"123456"}'
```

Output:
```json
{
  "id":"93c81cc8-110f-4f22-a481-4d110333f1fc",
  "createdAt":"2025-11-10T21:11:07.272Z",
  "updatedAt":"2025-11-10T21:11:07.272Z",
  "email":"walt@breakingbad.com",
  "isChirpyRed":false,
  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGlycHkiLCJzdWIiOiI5M2M4MWNjOC0xMTBmLTRmMjItYTQ4MS00ZDExMDMzM2YxZmMiLCJpYXQiOjE3NjI4MDE5MTUsImV4cCI6MTc2MjgwNTUxNX0.DJrM4_fHCWFBlWX0eElyFIGcBZ2obQR0ibj7XRpj7Lw",
  "refreshToken":"9b2070a8d860e4f6781acf44ccd5492fe755c67dc2fc8ab18090b3ed5a83dafc"
}
```

Store the token and user id in a bash variables `USER_TOKEN`, `USER_REFRESH_TOKEN` and `USER_ID` to reuse it. Example (use token, refresh token and id from user login):
```bash
USER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGlycHkiLCJzdWIiOiI5M2M4MWNjOC0xMTBmLTRmMjItYTQ4MS00ZDExMDMzM2YxZmMiLCJpYXQiOjE3NjI4MDE5MTUsImV4cCI6MTc2MjgwNTUxNX0.DJrM4_fHCWFBlWX0eElyFIGcBZ2obQR0ibj7XRpj7Lw"
USER_ID="93c81cc8-110f-4f22-a481-4d110333f1fc"
USER_REFRESH_TOKEN="9b2070a8d860e4f6781acf44ccd5492fe755c67dc2fc8ab18090b3ed5a83dafc"
```

#### Post chirp:
First post:
```bash
curl -X POST http://localhost:8080/api/chirps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d '{"body":"I am the one who knocks!"}'
```

Output:
```json
{
  "id":"ffcdf598-e0e3-4c4a-8918-66cbe8a5ae28",
  "createdAt":"2025-11-10T21:16:18.764Z",
  "updatedAt":"2025-11-10T21:16:18.764Z",
  "body":"I am the one who knocks!",
  "userId":"93c81cc8-110f-4f22-a481-4d110333f1fc"
}
```

Second post:

```bash
curl -X POST http://localhost:8080/api/chirps \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d '{"body":"We need to cook"}'
```

Output:
```json
{
  "id":"ca64ce9f-7a03-4bc8-95ae-cf8ad3314860",
  "createdAt":"2025-11-10T21:17:05.626Z",
  "updatedAt":"2025-11-10T21:17:05.626Z",
  "body":"We need to cook",
  "userId":"93c81cc8-110f-4f22-a481-4d110333f1fc"
}
```

#### Update user info:
```bash
curl -X PUT http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d '{"email":"walter@breakingbad.com","password":"losPollosHermanos"}'
```

Output:
```json
{
  "id":"93c81cc8-110f-4f22-a481-4d110333f1fc",
  "createdAt":"2025-11-10T21:11:07.272Z",
  "updatedAt":"2025-11-10T19:17:43.344Z",
  "email":"walter@breakingbad.com",
  "isChirpyRed":false
}
```


#### Retrieve all chirps (sorted `desc` or `asc`):
```bash
curl http://localhost:8080/api/chirps?sort=desc
```

Output:
```json
[
  {
    "id":"ca64ce9f-7a03-4bc8-95ae-cf8ad3314860",
    "createdAt":"2025-11-10T21:17:05.626Z",
    "updatedAt":"2025-11-10T21:17:05.626Z",
    "body":"We need to cook",
    "userId":"93c81cc8-110f-4f22-a481-4d110333f1fc"
  },
  {
    "id":"ffcdf598-e0e3-4c4a-8918-66cbe8a5ae28",
    "createdAt":"2025-11-10T21:16:18.764Z",
    "updatedAt":"2025-11-10T21:16:18.764Z",
    "body":"I am the one who knocks!",
    "userId":"93c81cc8-110f-4f22-a481-4d110333f1fc"
  }
]
```

Store the chirp id in a bash variable `CHIRP_ID` to reuse it. Example (use chirp id from retrieve all chirps):
```bash
CHIRP_ID="955d289f-c13f-49fe-b0b2-0670730ba56b"
```

#### Get chirp by ID:
```bash
curl http://localhost:8080/api/chirps/${CHIRP_ID}
```

Output:
```json
{
  "id":"ca64ce9f-7a03-4bc8-95ae-cf8ad3314860",
  "createdAt":"2025-11-10T21:17:05.626Z",
  "updatedAt":"2025-11-10T21:17:05.626Z",
  "body":"We need to cook",
  "userId":"93c81cc8-110f-4f22-a481-4d110333f1fc"
}
```

#### Delete chirp:
```bash
curl -X DELETE http://localhost:8080/api/chirps/${CHIRP_ID} \
  -H "Authorization: Bearer ${USER_TOKEN}"
```

Retrieve all chirps
```bash
curl http://localhost:8080/api/chirps?sort=desc
```

Output:
```json
[
  {
    "id":"ffcdf598-e0e3-4c4a-8918-66cbe8a5ae28",
    "createdAt":"2025-11-10T21:16:18.764Z",
    "updatedAt":"2025-11-10T21:16:18.764Z",
    "body":"I am the one who knocks!",
    "userId":"93c81cc8-110f-4f22-a481-4d110333f1fc"
  }
]
```

#### Filter chirps by user:
```bash
curl http://localhost:8080/api/chirps?author_id=${USER_ID}
```

Output:
```json
[
  {
    "id":"ffcdf598-e0e3-4c4a-8918-66cbe8a5ae28",
    "createdAt":"2025-11-10T21:16:18.764Z",
    "updatedAt":"2025-11-10T21:16:18.764Z",
    "body":"I am the one who knocks!",
    "userId":"93c81cc8-110f-4f22-a481-4d110333f1fc"
  }
]
```

#### Polka webhook:
Boot.Dev webhook endpoint test with api key `f271c81ff7084ee5b99a5091b42d486e` to upgrade user to chirpy red.
```bash
curl -X POST http://localhost:8080/api/polka/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: ApiKey f271c81ff7084ee5b99a5091b42d486e" \
  -d '{"event":"user.upgraded","data":{"userId":"'"$USER_ID"'"}}'
```

To see user chirp red run update user info:
```bash
curl -X PUT http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -d '{"email":"walter@breakingbad.com","password":"losPollosHermanos"}'
```

Output:
```json
{
  "id":"93c81cc8-110f-4f22-a481-4d110333f1fc",
  "createdAt":"2025-11-10T21:11:07.272Z",
  "updatedAt":"2025-11-10T19:30:00.528Z",
  "email":"walter@breakingbad.com",
  "isChirpyRed":true
}
```

#### Refresh access token:
```bash
curl -X POST http://localhost:8080/api/refresh \
  -H "Authorization: Bearer ${USER_REFRESH_TOKEN}"
```

Output:
```json
{
  "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGlycHkiLCJzdWIiOiI5M2M4MWNjOC0xMTBmLTRmMjItYTQ4MS00ZDExMDMzM2YxZmMiLCJpYXQiOjE3NjI4MDMwMzAsImV4cCI6MTc2MjgwNjYzMH0.vYu1az6HFBp9ximComWA_MKzk-OnZ9tis_lyV5B3Hyo"
}
```

Set new refresh token:
```bash
USER_REFRESH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaGlycHkiLCJzdWIiOiI5M2M4MWNjOC0xMTBmLTRmMjItYTQ4MS00ZDExMDMzM2YxZmMiLCJpYXQiOjE3NjI4MDMwMzAsImV4cCI6MTc2MjgwNjYzMH0.vYu1az6HFBp9ximComWA_MKzk-OnZ9tis_lyV5B3Hyo"
```

#### Revoke refresh token:
```bash
curl -X POST http://localhost:8080/api/revoke \
  -H "Authorization: Bearer ${USER_REFRESH_TOKEN}"
```

Run refresh access token:
```bash
curl -X POST http://localhost:8080/api/refresh \
  -H "Authorization: Bearer ${USER_REFRESH_TOKEN}"
```

Output:
```bash
{
  "error":"Refresh token not found"
}
```

---

## Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/healthz/` | Health check |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users` | Update user info (requires JWT auth) |
| POST | `/api/login` | Log in and receive access + refresh tokens |
| POST | `/api/refresh` | Refresh access token using refresh token |
| POST | `/api/revoke` | Revoke a refresh token |
| POST | `/api/chirps` | Create a new chirp (requires JWT auth) |
| GET | `/api/chirps` | List all chirps (supports `author_id` and `sort=asc|desc` query params) |
| GET | `/api/chirps/{chirpID}` | Get a single chirp by ID |
| DELETE | `/api/chirps/{chirpID}` | Delete chirp (author only, requires JWT auth) |
| POST | `/api/polka/webhooks` | Handle Polka payment webhooks for upgrades |
| GET | `/admin/metrics` | View site visit metrics |
| POST | `/admin/reset` | Reset all users and metrics |
