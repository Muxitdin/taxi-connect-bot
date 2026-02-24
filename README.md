# Taxi Connect Bot

Telegram bot for connecting passengers with drivers. Passengers can order a taxi, and drivers receive orders in a dedicated group with the ability to accept them.

## Features

- **Bilingual Support**: Uzbek (default) and Russian languages
- **User Authentication**: Phone number verification on first use
- **Taxi Ordering**: Complete flow with route, time, passengers, and comments
- **Driver Group Integration**: Orders are posted to a driver group with accept button
- **Deep Link Acceptance**: Drivers click button and are redirected to bot to accept
- **Order Management**: View order history, profile information
- **Real-time Notifications**: Both passenger and driver receive updates

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Bot Framework**: grammyJS
- **Database**: MongoDB
- **Dev Tools**: Nodemon, ts-node

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Telegram Group for drivers

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taxi-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see Configuration section)

## Configuration

Edit the `.env` file with your settings:

```env
BOT_TOKEN=your_telegram_bot_token_here
MONGODB_URI=mongodb://localhost:27017/taxi-connect
DRIVERS_GROUP_ID=-1001234567890
PORT=3000
```

### Getting the values:

#### BOT_TOKEN
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow instructions
3. Copy the token provided

#### DRIVERS_GROUP_ID
1. Create a Telegram group for drivers
2. Add your bot to the group as admin
3. Add [@myidbot](https://t.me/myidbot) to the group
4. Send **_/getgroupid_** command
4. It will show the group ID
5. Remove @myidbot after getting the ID

#### MONGODB_URI
- **Local**: `mongodb://localhost:27017/taxi-connect`
- **Atlas**: `mongodb+srv://user:password@cluster.mongodb.net/taxi-connect`

## Running the Bot

### Development mode (with auto-reload)
```bash
npm run dev
```

### Production mode
```bash
npm run build
npm start
```

## Usage Guide

### For Passengers

1. **Start the bot**: Send `/start` to the bot
2. **Select language**: Choose Uzbek or Russian
3. **Share phone**: Click the button to share your phone number
4. **Order a taxi**:
   - Click "Taksi buyurtma qilish" / "Заказать такси"
   - Select departure city (Tashkent, Andijan, Namangan, Fergana)
   - Select destination city
   - Choose departure time (00:00 - 23:00)
   - Select number of passengers (1-4)
   - Choose phone number (registered or enter new)
   - Add optional comment for driver
   - Confirm order
5. **Wait for driver**: You'll receive a notification when a driver accepts

### For Drivers

1. **Join the drivers group**: Get added to the Telegram group
2. **View orders**: New orders appear in the group with details
3. **Accept order**: Click "Qabul qilish / Принять" button
4. **Contact passenger**: You'll receive passenger's phone number in private chat
5. **Decline if needed**: Click "Отклонить заказ" if you can't complete the trip

### Main Menu Options

| Uzbek | Russian | Description |
|-------|---------|-------------|
| Taksi buyurtma qilish | Заказать такси | Create new taxi order |
| Mening buyurtmalarim | Мои заказы | View your order history |
| Mening profilim | Мой профиль | View profile information |
| Tilni o'zgartirish | Сменить язык | Change language |

## Project Structure

```
taxi-connect/
├── src/
│   ├── handlers/          # Bot command and callback handlers
│   │   ├── start.ts       # /start command and authentication
│   │   ├── order.ts       # Taxi ordering flow
│   │   ├── driver.ts      # Driver accept/decline logic
│   │   ├── profile.ts     # Profile and orders display
│   │   └── index.ts       # Export all handlers
│   ├── keyboards/         # Telegram keyboards (inline & reply)
│   │   └── index.ts
│   ├── locales/           # Translations
│   │   ├── uz.ts          # Uzbek language
│   │   ├── ru.ts          # Russian language
│   │   └── index.ts       # Translation helper functions
│   ├── middleware/        # Bot middleware
│   │   └── session.ts     # Session management
│   ├── models/            # MongoDB models
│   │   ├── User.ts        # User schema
│   │   ├── Order.ts       # Order schema
│   │   └── index.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   └── index.ts
│   └── index.ts           # Main entry point
├── .env                   # Environment variables (create from .env.example)
├── .env.example           # Example environment file
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Available Routes

The bot includes Express routes for health checks:

| Route | Description |
|-------|-------------|
| `GET /` | Status check |
| `GET /health` | Health check endpoint |

## Order Flow Diagram

```
Passenger                    Bot                      Driver Group
    |                         |                            |
    |-- /start -------------->|                            |
    |<-- Language selection --|                            |
    |-- Select language ----->|                            |
    |<-- Phone request -------|                            |
    |-- Share phone --------->|                            |
    |<-- Main menu -----------|                            |
    |-- Order taxi ---------->|                            |
    |<-- Route selection -----|                            |
    |-- Select route -------->|                            |
    |<-- Time selection ------|                            |
    |-- Select time --------->|                            |
    |<-- Passengers ---------|                            |
    |-- Select count -------->|                            |
    |<-- Phone selection -----|                            |
    |-- Confirm phone ------->|                            |
    |<-- Comment request -----|                            |
    |-- Skip/Add comment ---->|                            |
    |<-- Order summary -------|                            |
    |-- Confirm order ------->|                            |
    |<-- "Order created" -----|-- New order posted ------->|
    |                         |                            |
    |                         |<---- Driver clicks accept -|
    |                         |                            |
    |<-- "Order accepted" ----|-- Order details + phone --> (to driver private chat)
    |                         |                     
```
