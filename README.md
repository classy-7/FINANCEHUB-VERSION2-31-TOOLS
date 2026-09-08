

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

The development server uses `http://localhost:3000` by default. To use another local port in PowerShell, run `$env:PORT=3100; npm run dev`. Do not use `https://localhost:3000` unless you configure a local TLS certificate. Vercel provides HTTPS for the deployed domain and manages its production port automatically.
