# ReceptionAI 🌸

ReceptionAI (virtual receptionist mascot **Bloomie**) is a premium, virtual receptionist MVP built for dental studios, boutique spas, and small businesses. It answers incoming phone calls, processes customer messages (Web Chat, SMS, WhatsApp, Instagram), replies to FAQs dynamically, classifies incoming requests by urgency, and manages escalations in a gorgeous, cutesy, Pinterest-style pastel SaaS command center.

---
<img width="959" height="419" alt="image" src="https://github.com/user-attachments/assets/0d4b7959-e094-4435-9399-398e581c61d5" />
<img width="959" height="274" alt="image" src="https://github.com/user-attachments/assets/621c88b9-f2b2-4d4f-b255-cc33449c1cb3" />
<img width="957" height="412" alt="image" src="https://github.com/user-attachments/assets/5993143c-71dd-4b9e-bb3d-5dd90189f5f5" />
<img width="959" height="414" alt="image" src="https://github.com/user-attachments/assets/4f4066dd-3028-4a02-99ba-e36944518865" />
<img width="957" height="408" alt="image" src="https://github.com/user-attachments/assets/e94527a8-dee4-4ace-90ba-0448ea0f29b0" />
<img width="959" height="408" alt="image" src="https://github.com/user-attachments/assets/2cff9f38-9208-4ab1-a3fd-46dd09763534" />
<img width="959" height="409" alt="image" src="https://github.com/user-attachments/assets/0fd87ce9-50cc-4e6a-abbb-b457f69c6c98" />

## Features 🍬

1. **AI Phone Receptionist**: Simulated call answering, real-time audio transcript logs, and custom text-to-speech dialogue feeds.
2. **Unified Messaging Inbox**: Consolidates Web Chat, SMS, WhatsApp, and Instagram DMs into a single split-pane interface.
3. **Automatic Urgency Classification**: Identifies billing discrepancies (e.g. "charged twice"), severe pain, chip/fracture tooth emergencies, and flags them for human takeover.
4. **Knowledge Base Manager**: CRUD list of FAQs which the AI receptionist references dynamically to reply to customer questions.
5. **Business Settings & Hours**: Set weekly opening and closing schedules. The AI dynamically lets clients know if the clinic is closed.
6. **Pastel Analytics Dashboard**: Displays call lists, traffic channel shares, AI auto-resolution rates, and volume timelines in custom pastel-shaded charts.
7. **Interactive Mascot Companion**: A code-based, animated SVG mascot that waves, blinks, thinks, and speaks depending on active events.

---

## Project Structure 📁

```text
AIreceptionist/
│
├── client/                     # Frontend Vite + React + TS (Port 3000)
│   ├── src/
│   │   ├── components/         # Reusable UI elements (cards, Mascot.tsx)
│   │   ├── pages/              # Landing, Auth, Overview, Inbox, AI config, FAQ, Settings, Analytics
│   │   ├── services/           # api.ts wrapper communicating with backend
│   │   └── App.tsx             # Protected routing & global notification polling
│   └── package.json
│
├── server/                     # Backend Node.js + Express + TS (Port 5000)
│   ├── src/
│   │   ├── controllers/        # Route controllers (Auth, Business, FAQ, Conversations, Analytics)
│   │   ├── services/           # aiService.ts, voiceService.ts, messagingService.ts
│   │   ├── middleware/         # JWT checking middleware
│   │   └── app.ts              # Express initialization
│   └── package.json
│
├── prisma/                     # ORM Models & Migrations
│   ├── schema.prisma           # Relational schema
│   └── seed.ts                 # Database seeder (Bloom Dental Studio data)
│
├── vercel.json                 # Frontend deployment configuration
├── .env                        # Configuration file
└── package.json                # Root concurrent scripts
```

---

## Local Setup & Quickstart 🚀

Follow these steps to run the application locally on your system:

### 1. Install Node.js Dependencies
Install all package dependencies in the root, client, and server folders:
```bash
npm run install:all
```

### 2. Setup the SQLite Database
Verify that your `.env` contains:
```env
DATABASE_URL="file:./dev.db"
```
Then, run migrations and seed the database with the preloaded Bloom Dental Studio data:
```bash
npm run db:setup
```

### 3. Launch the Application
Run both the React client and Express server concurrently in hot-reload development mode:
```bash
npm run dev
```
- Frontend will open at: [http://localhost:3000](http://localhost:3000)
- Backend will run at: [http://localhost:5000](http://localhost:5000)

### 4. Logging in / Demo Mode
On the Auth login screen, you can:
- Create a new account (which automatically seeds default opening hours and FAQs).
- Click the **"Dr. Bloom Demo Bypass 🔑"** button. This automatically logs you into the preseeded Bloom Dental Studio account so you can explore the dashboard populated with mock data immediately.

---

## Production Deployment Guide 🌍

Our workspace includes production-ready code designed for seamless, automated deployment. We host the Frontend on **Vercel** and the Backend API on **Render**, backed by a production-grade **PostgreSQL** database.

### 📐 Deployment Architecture

```mermaid
graph TD
    Client[React Frontend - Vite on Vercel] <-->|HTTPS API requests / JWT Auth| Server[Express Backend on Render]
    Server <-->|Prisma Client| Database[(PostgreSQL Database)]
```

---

### 📦 Implementation Details Built for Cloud Deployment

To make cloud deployments zero-hassle, we have already implemented the following configurations:
1. **Dynamic Backend CORS Policy**: In [`server/src/app.ts`](file:///server/src/app.ts), the CORS middleware automatically trusts any source matching `*.vercel.app` as well as the custom frontend url specified in `APP_URL`.
2. **Automated DB Setup on Build**: In [`server/package.json`](file:///server/package.json), the custom `build` script compiles the server, generates the Prisma schema, and automatically runs `npx prisma db push` and `npx prisma db seed` if the `RENDER=true` environment variable is defined.
3. **Vercel Router Compatibility**: The [`vercel.json`](file:///vercel.json) file at the root configures Vercel's output directory to `client/dist` and enables fallback rewrites to support React Router single-page application routing.

---

### 🛠️ Step 1: Provision a PostgreSQL Database
You can provision a managed PostgreSQL database on any provider (such as Neon, Supabase, Render PostgreSQL, AWS RDS, etc.). 
Copy your PostgreSQL connection URL. It will look like this:
```text
postgresql://username:password@hostname:5432/databasename?sslmode=require
```

---

### 🚀 Step 2: Deploy the Backend on Render

1. Sign in to your [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Web Service**.
2. Connect your Git repository.
3. Configure the service details:
   - **Name**: `ai-receptionist-backend`
   - **Environment**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. Expand the **Advanced** section to add the following **Environment Variables**:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `RENDER` | `true` | **Critical**: Triggers automatic Prisma migrations and seeding on Render build. |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | Your PostgreSQL connection string. |
| `JWT_SECRET` | `generate_some_long_secure_random_string` | Secret key used to sign and verify JWT authentication tokens. |
| `APP_URL` | `https://ai-receptionist-frontend.vercel.app` | URL of your deployed Vercel frontend (authorizes CORS). |
| `AI_API_KEY` | *(Optional)* | Your OpenAI / Anthropic key (defaults to demo simulation if empty). |
| `VOICE_API_KEY` | *(Optional)* | Key for telephony voice synthesizers. |
| `MESSAGING_API_KEY` | *(Optional)* | Key for communication APIs. |

5. Click **Deploy Web Service**. Render will automatically run the build, push the schema to your PostgreSQL database, and seed the demo data. Copy your backend service URL (e.g. `https://ai-receptionist-backend.onrender.com`).

---

### 🌸 Step 3: Deploy the Frontend on Vercel

1. Log in to the [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Import your Git repository.
3. Configure the Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Keep it as the repository root (`.`). Vercel reads [`vercel.json`](file:///vercel.json) to locate the compiled bundle in `client/dist`.
   - **Build Command**: `npm run build:client`
   - **Output Directory**: `client/dist`
4. Expand the **Environment Variables** section and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://ai-receptionist-backend.onrender.com/api` | The deployed Render backend endpoint. Make sure it ends in `/api`. |

5. Click **Deploy**. Vercel will build the frontend client and host it at a custom URL (e.g. `https://ai-receptionist-frontend.vercel.app`).
6. *Optional*: Copy this URL and update the `APP_URL` environment variable in your Render settings to lock down CORS access.

---

## Switching Database to PostgreSQL in Production (Manual Steps) 🔌

If you need to sync the database schema manually at any time:

1. Update the `datasource` block in [`schema.prisma`](file:///prisma/schema.prisma):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update the `DATABASE_URL` connection string in your `.env`.
3. Regenerate client and push database models:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## Connecting External Communication Providers 📞

### 1. Voice Integration (e.g., Twilio)
To connect a real voice telephone line using Twilio:
1. Complete Twilio Console signup and buy a phone number.
2. In your `.env` or Render environment settings, fill:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_purchased_phone_number
   ```
3. Set your Twilio Phone Number's **Incoming Call Webhook** to point to:
   `https://your-backend.onrender.com/api/webhooks/voice-incoming`
4. The backend voice router will accept incoming calls, generate TwiML voice XML responses, capture customer audio, run speech-to-text, query the receptionist `aiService`, and speak the generated reply.

### 2. Messaging Integration (e.g., WhatsApp / Instagram / SMS)
To wire up a messaging channel:
1. Connect a WhatsApp Business API account or Facebook Messenger developer app.
2. Configure webhook subscription topics to point to:
   `https://your-backend.onrender.com/api/webhooks/message-incoming`
3. Parse the message body: extract `From` contact metadata and message text content.
4. Call `messagingService.receiveMessage` with the payload fields to save the chat thread, trigger the AI responder, and push toast alerts to active dashboards.

---

## API Endpoints Summary 📝

### Public / Auth
- `POST /api/auth/signup` - Register a business and admin user
- `POST /api/auth/login` - Login to business command desk
- `POST /api/auth/demo` - Admin session bypass for instant demo mode

### Business & FAQs (JWT Protected)
- `GET /api/business/profile` - Fetch business details and hours
- `PUT /api/business/profile` - Edit business attributes
- `PUT /api/business/hours` - Configure daily open/close schedules
- `GET /api/faqs` - Read FAQs list (supports filter categories)
- `POST /api/faqs` - Create new FAQ entry
- `PUT /api/faqs/:id` - Edit FAQ contents
- `DELETE /api/faqs/:id` - Delete FAQ

### Inbox & Alerts (JWT Protected)
- `GET /api/conversations` - List conversations (channels/urgencies filters)
- `GET /api/conversations/:id` - Details + messages dialogue thread
- `POST /api/conversations/:id/messages` - Send customer response (AI or manual human)
- `POST /api/conversations/:id/notes` - Add internal agent notes
- `PUT /api/conversations/:id/resolve` - Mark conversation resolved/active
- `POST /api/conversations/:id/takeover` - Takeover conversation from AI
- `GET /api/notifications` - Fetch active notification centers
- `POST /api/notifications/read-all` - Read all alerts
- `PUT /api/notifications/:id/read` - Read notification

### Analytics & Simulation
- `GET /api/analytics` - Compile counts and timeline coordinates
- `POST /api/webhooks/simulate-message` - Inject simulated customer message
- `POST /api/webhooks/simulate-call` - Inject active voice call dialogue
- `POST /api/webhooks/simulate-hangup` - Conclude and resolve voice call log
