import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { app } from '../src/app.js'
import supertest from 'supertest'
import { beforeEach } from 'node:test'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    beforeEach(async () => {
        execSync('npm run knex migrate:rollback --all')
       execSync('npm run knex migrate:latest')
    })

    it('should be able to create a new transaction', async () => {
        await supertest(app.server).post('/transactions').send({
            title: 'New transaction',
            amount: 100,
            type: 'credit',
        }).expect(201)

    })

    it('should be able to list all transactions', async () => {
        const createTransactionResponse = await supertest(app.server).post('/transactions').send({
            title: 'New transaction',
            amount: 100,
            type: 'credit',
        }).expect(201)

        const cookies = createTransactionResponse.get('Set-Cookie')

        const listTransactionsResponse = await supertest(app.server).get('/transactions').set('Cookie', cookies)

        expect(listTransactionsResponse.body.transactions).toEqual(
            [
                expect.objectContaining({
                    title: 'New transaction',
                    amount: 100,
                }),
            ]
        )
    })

    it('should be able to get a specific transaction', async () => {
        const createTransactionResponse = await supertest(app.server).post('/transactions').send({
            title: 'New transaction',
            amount: 100,
            type: 'credit',
        }).expect(201)

        const cookies = createTransactionResponse.get('Set-Cookie')

        const listTransactionsResponse = await supertest(app.server).get('/transactions').set('Cookie', cookies)

        const transactionId = listTransactionsResponse.body.transactions[0].id

        const getTransactionResponse = await supertest(app.server).get(`/transactions/${transactionId}`).set('Cookie', cookies)

        expect(getTransactionResponse.body.transactions).toEqual(
                expect.objectContaining({
                title: 'New transaction',
                amount: 100,
            }),
        )
    })

    it('should be able to get the summary of the transactions', async () => {
        const createTransactionResponse = await supertest(app.server).post('/transactions').send({
            title: 'New transaction',
            amount: 100,
            type: 'credit',
        }).expect(201)

        const cookies = createTransactionResponse.get('Set-Cookie')

        const summaryResponse = await supertest(app.server).get('/transactions/summary').set('Cookie', cookies)
        expect(summaryResponse.body.summary).toEqual({
            amount: 100,
        })
    })
})
