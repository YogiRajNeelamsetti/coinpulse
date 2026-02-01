# CoinPulse 🚀

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A real-time cryptocurrency market tracker that provides live price updates, interactive charts, and comprehensive market data for thousands of cryptocurrencies.

![Screenshot](./screenshot.png)

---

## ✨ Features

- **📊 Real-Time Market Data** — Track live prices, market caps, and 24h volume for thousands of cryptocurrencies
- **📈 Interactive Charts** — Visualize price movements with dynamic candlestick and line charts
- **🔍 Instant Search** — Quickly find any cryptocurrency with a powerful search modal
- **💱 Currency Converter** — Convert between cryptocurrencies and fiat currencies in real-time
- **📱 Responsive Design** — Seamless experience across desktop, tablet, and mobile devices
- **🌙 Dark Mode** — Eye-friendly dark theme optimized for extended viewing

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui |
| **Charts** | Lightweight Charts |
| **Data Fetching** | TanStack Query |
| **API** | CoinGecko API |
| **Deployment** | Vercel |

---

## 🌐 Live Demo

Experience CoinPulse live: **[https://coinpulse-crypto-market.vercel.app/](https://coinpulse-crypto-market.vercel.app/)**

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YogiRajNeelamsetti/coinpulse.git
   cd coinpulse
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📖 Usage

### Home Page
Browse trending cryptocurrencies, top gainers/losers, and market categories at a glance.

### Coin Details
Click on any cryptocurrency to view detailed information including:
- Price history with interactive charts
- Market statistics (market cap, volume, supply)
- Available trading pairs and exchanges

### Search
Press `Ctrl + K` (or `Cmd + K` on Mac) to open the search modal and quickly find any cryptocurrency.

### Converter
Use the built-in converter to calculate exchange rates between different cryptocurrencies.

---

## 📁 Project Structure

```
coinpulse/
├── app/                    # Next.js App Router pages
│   ├── coins/              # Coins listing and detail pages
│   ├── globals.css         # Global styles and Tailwind config
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Feature components
├── lib/                    # Utility functions and API calls
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Commit your changes**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

4. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**

### Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages (we recommend [Conventional Commits](https://www.conventionalcommits.org/))
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for providing the cryptocurrency data API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Vercel](https://vercel.com/) for hosting and deployment

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/YogiRajNeelamsetti">Yogi Raj Neelamsetti</a>
</p>
