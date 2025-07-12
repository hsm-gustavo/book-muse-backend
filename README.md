# 📚 BookMuse API - NestJS Backend

BookMuse API is the official backend for BookMuse — a modern social reading and book review platform. This RESTful API, built with NestJS and Prisma, provides all the necessary features for authentication, user management, reviews, reading tracking, social interactions, and more.

> ⚠️ This is a separate backend service and must be run alongside the frontend (Next.js 15 + React 19).

---

## ✨ Features

The API offers a secure and scalable backend for:

### 🔐 Authentication

- Email/password login
- Access and refresh token handling (JWT)
- Optional and required auth guards

### 👤 Users

- User registration and login
- Profile management with profile picture
- Followers / Following logic
- Count of followers and followings
- Search users by name or email (with cursor-based pagination)

### 📚 Reading Status

- Mark books as:
  - `reading`
  - `read`
  - `want_to_read`
  - `abandoned`
- Count books read by a user

### ✍️ Reviews

- Create, edit, and delete reviews
- Fetch reviews by user or by ID
- Like and unlike reviews
- Count likes and check if liked by current user

### 🤝 Social

- Follow/unfollow other users
- View followers and followings
- Search and discover users

---

## 🛠️ Technologies Used

- **NestJS** – Progressive Node.js framework
- **Prisma** – Next-gen ORM with PostgreSQL
- **PostgreSQL** – Relational database
- **JWT (Passport.js)** – Authentication system
- **Cloudflare R2 (S3 Compatible)** – For storing profile pictures via signed URL
- **Class Validator & Transformer** – DTO validation and transformation

---

## ⚙️ Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/hsm-gustavo/book-muse-backend
cd book-review-backend
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**

```ini
REDIS_URL=<redis url>
DATABASE_URL=<postgresql url>
PORT=<port number, default 3000>

JWT_SECRET=your jwt secret
JWT_TOKEN_AUDIENCE=<aud>
JWT_TOKEN_ISSUER=<issuer>
JWT_TTL=<time to live number, default 3600>

R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_REGION=auto
R2_ACCESS_KEY=<your_access_key>
R2_SECRET_KEY=<your_secret_key>
R2_BUCKET=<bucket-name>
```

4. **Run Prisma migrations**

```bash
pnpx prisma migrate dev --name init
```

5. **Start the development server**

```bash
pnpm start:dev
```

API will be available at `http://localhost:<PORT>`

---

## 🔍 Key Endpoints

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users/:id`
- `GET /users/search?query=...&take=...&cursor=...`
- `GET /users/:id/followers`
- `GET /users/:id/following`
- `POST /follow/:userId`
- `POST /unfollow/:userId`
- `GET /reviews/:id`
- `GET /reviews/user/:userId`
- `POST /reviews`
- `PATCH /reviews/:id`
- `DELETE /reviews/:id`
- `POST /reviews/:id/like`
- `DELETE /reviews/:id/like`
- `GET /reading-status`
- `POST /reading-status`
- `PATCH /reading-status/:id`

---

## 🚀 Roadmap

- Notifications
- Collections / Custom shelves
- Admin moderation panel
- Commenting on reviews
- Multi-language support (i18n)
- Richer book data integration (e.g. Goodreads)
- Currently missing tests

## 🧑‍💻 Contributing

Open to issues and PRs. Feel free to improve the codebase!

## 📄 License

MIT – Gustavo Henrique © 2025

This project uses adapted code from [nestjs-prisma](https://github.com/notiz-dev/nestjs-prisma), licensed under the MIT License.
