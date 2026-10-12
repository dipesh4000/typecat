import { app } from '../server/app.js'

export default { fetch: (request: Request) => app.fetch(request) }
