import { app } from '../server/app.ts'

export default { fetch: (request: Request) => app.fetch(request) }
