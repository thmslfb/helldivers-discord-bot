# Super Earth Broadcast <img src="https://cdn.discordapp.com/app-icons/1338127626564407306/d783f5d249379c70ac4a38e59c668574.png?size=128" width="36" height="36" style="border-radius: 10%; vertical-align: middle; position: relative; top: -2px; margin-left: 8px;" alt="Super Earth Broadcast Logo">

A Discord bot for Helldivers 2 players, delivering real-time game updates, war status tracking, and community features.

---

## ✨ Features

- 🔔 **Real-time war status updates** from Helldivers 2
- 🗺️ **Planet tracking** with liberation progress
- 📊 **Statistical reporting** on community efforts
- 🏆 **Major Order notifications** and completion tracking
- 🤖 **Discord slash commands** for game information
- 🔄 **Automatic deployment** via CI/CD pipeline
- 🐳 **Containerized deployment** with Docker

## 🛠️ Tech Stack

- **Node.js**
- **Discord.js** (Bot framework)
- **Docker** (Containerization)
- **GitHub Actions** (CI/CD)
- **ESLint** (Code quality)
- **PostgreSQL** (Database)

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+
- ✅ Discord bot token and application
- ✅ PostgreSQL database
- ✅ Docker and Docker Compose (for production)
- ✅ GitHub account (for CI/CD)

## 🚀 Installation

### 1. Clone the repository:

```bash
git clone https://github.com/thmslfb/helldivers-discord-bot.git
cd helldivers-discord-bot
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Set up environment variables:

```bash
cp .env.example .env
```

### 4. Configure your `.env` file:

```env
# Discord.js
TOKEN="your-discord-bot-token"
GUILD_ID="your-discord-server-id"
USER_ID="your-discord-user-id"
ROLE_ID="role-id-for-permissions"
CLIENT_ID="your-bot-client-id"

# Channels
WAR_UPDATES_CHANNEL_ID="channel-for-war-updates"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/helldivers"

# API
DIVEHARDER_API_URL="https://api.diveharder.com/v1"
HELLDIVERS_API_URL="https://api.helldivers2.dev/api/v1"

# Info
SUPER_CLIENT="your-client-identification"
SUPER_CONTACT="your-contact-info"
```

## 🏃‍♂️ Development

Start the development server:

```bash
node .
```

## 🐳 Docker Development

Run with Docker Compose:

```bash
docker compose up -d
```

## 🔄 CI/CD Pipeline

This project is configured with a robust CI/CD pipeline using GitHub Actions:

### Continuous Integration (CI)

- ✅ **Automated testing** on every PR and push
- ✅ **Code quality checks** with ESLint
- ✅ **Build verification** to ensure Docker compatibility

### Continuous Deployment (CD)

- 🚀 **Automatic deployment** when code is merged to main
- 🛡️ **SSH-based secure deployments** to production server
- 📊 **Deployment status reporting** with detailed logs

## 🤖 Bot Commands

The bot currently supports:

- `/superstore` - Get the current Superstore rotation

Coming soon:

- Commands for **Terminids**, **Illuminists** and **Automatons**
- War status tracking
- Planet information
- And many others!

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add some amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎯 Open a Pull Request

## 💬 Support

Need help? Please [open an issue](https://github.com/thmslfb/helldivers-discord-bot/issues) in the repository.

## 👏 Acknowledgments

Special thanks to these amazing projects:

- [Discord.js](https://discord.js.org/)
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [GitHub Actions](https://github.com/features/actions)
- [DiveHarder API](https://github.com/helldivers-2/diveharder_api.py)
- [Helldivers 2 API](https://helldivers-2.github.io/api/#/README)
- [Arrowhead Game Studios](https://www.arrowheadgamestudios.com/)
