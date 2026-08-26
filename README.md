# ReceptionAI 🌸

ReceptionAI (virtual receptionist mascot **Bloomie**) is a premium, virtual receptionist MVP built for dental studios, boutique spas, and small businesses. It answers incoming phone calls, processes customer messages (Web Chat, SMS, WhatsApp, Instagram), replies to FAQs dynamically, classifies incoming requests by urgency, and manages escalations in a gorgeous, cutesy, Pinterest-style pastel SaaS command center.

---
![Uploading image.png…]()

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
├── .env                        # Configuration file
└── package.json                # Root concurrent scripts
```

---

## Local Setup & Quickstart 🚀

Follow these steps to run the application locally on your Windows system:

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
- Create a new account (which automatically seeds default opening hours and hours FAQs).
- Click the **"Dr. Bloom Demo Bypass 🔑"** button. This automatically logs you into the preseeded Bloom Dental Studio account so you can explore the dashboard populated with mock data immediately.

---

## Switching Database to PostgreSQL in Production 🔌

To transition the database from SQLite to PostgreSQL:

1. Update the `datasource` block in [schema.prisma](file:///prisma/schema.prisma):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update the `DATABASE_URL` connection string in your `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/reception_ai?schema=public"
   ```
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
2. In your `.env`, fill:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_purchased_phone_number
   ```
3. Set your Twilio Phone Number's **Incoming Call Webhook** to point to:
   `https://your-server-url.com/api/webhooks/voice-incoming`
4. The backend voice router will accept incoming calls, generate TwiML voice xml responses, capture customer audio, run speech-to-text, query the receptionist `aiService`, and speak the generated reply.

### 2. Messaging Integration (e.g., WhatsApp / Instagram / SMS)
To wire up a messaging channel:
1. Connect a WhatsApp Business API account or Facebook Messenger developer app.
2. Configure webhook subscription topics to point to:
   `https://your-server-url.com/api/webhooks/message-incoming`
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
