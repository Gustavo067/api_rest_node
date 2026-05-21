import fastify from 'fastify'
import { knex } from './database'
const app = fastify()

app.get('/hello',async  () => {
  const transaction = await knex.transaction("transaction")
  .where("amount", 1000)
  .select("*")

  return transaction
})

app
  .listen({
     port: env.PORT,
     }).then(() => {
  console.log('Server is running on port 3333')
})