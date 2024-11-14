import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsIn } from 'class-validator'
import { PaymentSystemTypes } from '../../../../../../../../libs/adapters/payments.adapter'

export class GetPremiumInputDto {
    @ApiProperty({
        enum: PaymentSystemTypes,
        default: 'stripe',
    })
    @IsEnum(PaymentSystemTypes)
    paymentSystem: string

    @ApiProperty({
        default: '1 day',
        enum: ['1 day', '7 days', '30 days'],
    })
    @IsIn(['1 day', '7 days', '30 days'])
    subscriptionType: string

    @ApiProperty({
        default: 10,
        enum: [10, 50, 100],
    })
    @IsIn([10, 50, 100])
    quantity: number
}
