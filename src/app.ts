import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions.js'
import cookie  from '@fastify/cookie'

export const app = fastify()

app.register(cookie)

app.addHook('preHandler', async (req, reply) => {
  console.log(`[${req.method}] ${req.url}`)
})

app.register(transactionsRoutes, {
  prefix: 'transactions',
})
