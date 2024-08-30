import { ApiProperty } from '@nestjs/swagger'

export class ProfileTpeDTOSwagger {
    @ApiProperty({ example: 0 })
    id: number
    @ApiProperty({ example: 0 })
    userId: number
    @ApiProperty({ example: 'string' })
    firstName: string
    @ApiProperty({ example: 'string' })
    lastName: string
    @ApiProperty({ example: '0189-12-11T21:29:43.000Z' })
    dateOfBirth: string
    @ApiProperty({ example: 'string' })
    country: string
    @ApiProperty({ example: 'string' })
    city: string
    @ApiProperty({ example: 'i am developer' })
    aboutMe: string
    @ApiProperty({ example: 'null' })
    avatarId: number
    @ApiProperty({ example: 0 })
    createdAt: string
    @ApiProperty({ example: 0 })
    updatedAt: string
}

export class UserTypeDTOSwagger {
    @ApiProperty({ example: 0 })
    id: number
    @ApiProperty({ example: 'ad1S_nQS' })
    userName: string
    @ApiProperty({ example: 'ad1S_nQS' })
    name: string
    @ApiProperty({ example: 'string' })
    email: string
    @ApiProperty({ example: '2024-08-30T15:06:13.310Z' })
    createdAt: string
    @ApiProperty({ example: 0 })
    avatarId: number
    @ApiProperty({ example: 'true' })
    isConfirmEmail: boolean
    @ApiProperty({ example: ProfileTpeDTOSwagger })
    profile: ProfileTpeDTOSwagger
}

export class UpdateProfileTpeDTOSwagger {
    @ApiProperty({ example: 1 })
    count: number
}
