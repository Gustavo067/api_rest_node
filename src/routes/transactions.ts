import { FastifyInstance } from "fastify"
import { knex } from "../database.js"
import { z } from "zod"
import { randomUUID } from "node:crypto"
import { checkSessionIdExist } from "../middlewares/check-session-id-exist.js"

export async function transactionsRoutes(app: FastifyInstance) {

    app.get('/', { preHandler: [checkSessionIdExist] }, async (req, reply) => {

        const { sessionId } = req.cookies

        const transactions = await knex('transactions')
            .where('session_id', sessionId)
            .select('*')

        return {
            transactions
        }
    })

    app.get('/:id', { preHandler: [checkSessionIdExist] }, async (req, reply) => {
        const { sessionId } = req.cookies
        const createTransactionBodySchema = z.object({
            id: z.string(),
        })
        const { id } = createTransactionBodySchema.parse(req.params)
        const transactions = await knex('transactions').where({
            id,
            session_id: sessionId,
        }).first()
        return {
            transactions
        }
    })

    app.get('/summary', { preHandler: [checkSessionIdExist] }, async (req, reply) => {
        const { sessionId } = req.cookies
        const summary = await knex('transactions').where('session_id', sessionId).sum('amount', { as: "amount" }).first()
        return {
            summary
        }
    })

    app.post('/', async (req, reply) => {

        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit']),
        })

        const { title, amount, type } = createTransactionBodySchema.parse(req.body)
        let sessionId = req.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()
            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        }

        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            type,
            session_id: sessionId,
        })

        return reply.status(201).send()

    })
}