# Deploy TypeCat to Vercel

One Vercel project hosts both Vite and `api/`. Root Directory: `typecat` (folder containing package.json). Build: `npm run build`. Output: `dist`. The build now checks frontend, backend, and Vercel's root TypeScript configuration.

## Production environment

Copy names from `.env.example`. Set your Privy app ID, SmoothSend **publishable** `pk_nogas_` key, contract address in both `VITE_GAME_ADDRESS` and `GAME_ADDRESS`, deployment block in `VITE_DEPLOY_BLOCK`, and server-only `VERIFIER_PRIVATE_KEY` matching the contract signer. Never use `VITE_` for private keys or put a secret SmoothSend key in the browser. Deployer key is local-only.

```dotenv
VITE_NETWORK=fuji
NETWORK=fuji
VITE_VERIFIER_URL=/api
ALLOWED_ORIGINS=https://typecat-rust.vercel.app
```

Redeploy after changing Vercel environment variables. Do not deploy another contract just to fix TypeScript or CORS.

## Three separate origin settings — configure all three

1. **SmoothSend dashboard**: open the project owning `VITE_SMOOTHSEND_KEY`. Add `https://typecat-rust.vercel.app` to its public API key/project CORS allowed origins. No trailing slash, `/api`, or `/login`. If using a preview URL or localhost, add that exact origin too. Changing TypeCat's `ALLOWED_ORIGINS` does **not** change SmoothSend's allowlist.
2. **Privy dashboard**: allow the same frontend origin for the app owning `VITE_PRIVY_APP_ID`. Keep Email login enabled.
3. **TypeCat backend**: `ALLOWED_ORIGINS` is only for requests to TypeCat's score-verification API. Separate multiple origins with commas.

`Create player · failed / CORS origin not allowed` occurs during sponsored transaction submission, not email OTP login. The installed SmoothSend SDK requires browsers to use an allowlisted origin with their public key. Do not disable CORS or proxy a secret sponsorship key as a workaround.

## Checks after redeploying

- `/api/health` returns JSON; `/api/verify` requires POST (GET returns 405).
- Signed-out `/stats`, `/settings`, `/achievements`, and `/leaderboard` redirect to `/login`; refreshing still works.
- Log in with email OTP. The side activity panel tracks queued → signing → submitted → confirmed/failed, with real transaction explorer links. It can be collapsed while typing.
- After fixing an allowlist, use **Retry connection** if account setup failed, or reload. Retry is manual; the app does not repeatedly spend sponsorship credits on failures.
- Complete a standard uninterrupted passage to verify scores and rankings. Custom and paused sessions remain local practice.

Local development: run `npm run verifier` and `npm run dev`; `/api` proxies to port 8787. Add the exact local origin shown by Vite to both provider dashboards. Set sponsor spending limits before public testing.
