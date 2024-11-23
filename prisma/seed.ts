import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    await prisma.product.create({
        data: {
            name: '1 day',
            currency: 'USD',
            amount: 10,
        },
    })

    await prisma.product.create({
        data: {
            name: '7 days',
            currency: 'USD',
            amount: 50,
        },
    })

    await prisma.product.create({
        data: {
            name: '30 days',
            currency: 'USD',
            amount: 100,
        },
    })

    await prisma.paymentSystem.create({
        data: {
            name: 'stripe',
        },
    })

    await prisma.paymentSystem.create({
        data: {
            name: 'paypal',
        },
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
