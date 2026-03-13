# E-Crypto Dash 🚀

[![Live Demo](https://img.shields.io/badge/Demo-Online-success.svg?style=for-the-badge)](https://e-crypto-dash-eight.vercel.app)

A modern, responsive, and highly optimized Cryptocurrency Dashboard built with Next.js 16, React 19, and Tailwind CSS v4. Track real-time market data across various cryptocurrencies, switch between currencies dynamically, and enjoy a seamless user experience.

## ✨ Key Features

- **Real-Time Market Data**: Displays up-to-date cryptocurrency prices and statistics (via CoinGecko).
- **Advanced State Management**: Combines the power of **Redux Toolkit** (with persistence) for client state and **React Query** for optimized server-side data fetching.
- **Dynamic Pagination**: Customizable items per page with optimized fetching logic.
- **Robust Rate Limiting**: Secures endpoints and limits excessive requests using **Upstash Redis**.
- **Real-time Charting**: Interactive charts and data visualization using **Recharts**.
- **High Performance**: Renders large asset lists efficiently with **React Virtual**.
- **Comprehensive Error Tracking**: Real-time error monitoring and performance tracing with **Sentry**.
- **WebSockets Support**: Live updates functionality using `socket.io-client`.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: Redux Toolkit, Redux Persist
- **Data Fetching**: React Query (@tanstack/react-query)
- **Database/Cache**: Upstash Redis
- **Testing**:
  - Unit Tests: Jest, React Testing Library
  - E2E Tests: Playwright
- **Monitoring**: Sentry (@sentry/nextjs)

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v18 or higher) installed on your machine.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/e-crypto-dash.git
   cd e-crypto-dash
   ```

2. **Install dependencies:**
   Using npm:

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory. You will need to add your necessary API keys here:

   ```env
   # Sentry Config
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

   # Upstash Redis (For Rate Limiting)
   UPSTASH_REDIS_REST_URL=your_upstash_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_token
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

## 🧪 Testing

This project is fully tested to ensure stability and reliability.

**Run Unit Tests:**

```bash
npm run test
```

**Run End-to-End Tests:**

```bash
npx playwright test
```

## 🌐 Live Demo

Check out the live application hosted on Vercel:
👉 **[E-Crypto Dash Live Demo](https://e-crypto-dash-eight.vercel.app)**

## 📄 License

This project is licensed under the MIT License.
