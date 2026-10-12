import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app.ts'

// Local development only. Vercel invokes api/*.ts without opening a port.
serve({ fetch: app.fetch, port: Number(process.env.PORT || 8787) })
