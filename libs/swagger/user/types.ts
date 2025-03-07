import { ApiProperty } from '@nestjs/swagger'

export class ProfileTpeDTOSwagger {
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
    @ApiProperty({ example: 'https://somesite.ok' })
    url: string
}

// export class ProfileTypeDTOSwagger {
//     @ApiProperty({ example: 0 })
//     id: number
//     @ApiProperty({ example: 'ad1S_nQS' })
//     userName: string
//     @ApiProperty({ example: 'string' })
//     email: string
//     @ApiProperty({ example: 'true' })
//     emailIsConfirm: boolean
//     @ApiProperty({ example: '2024-08-30T15:06:13.310Z' })
//     createdAt: string
//     @ApiProperty({ example: '2024-08-30T15:06:13.310Z' })
//     updatedAt: string
//     @ApiProperty({ example: ProfileTpeDTOSwagger })
//     profile: ProfileTpeDTOSwagger
//     @ApiProperty({ example: 0 })
//     followingCount: number
//     @ApiProperty({ example: 0 })
//     followersCount: number
//     @ApiProperty({ example: 0 })
//     publicationsCount: number
// }

export class ProfileTypeDTOSwagger {
    @ApiProperty({ example: 0 })
    id: number
    @ApiProperty({ example: 'string' })
    email: string
    @ApiProperty({ example: 'true' })
    emailIsConfirm: boolean
    @ApiProperty({ example: 'ad1S_nQS' })
    userName: string
    @ApiProperty({ example: 'ad1S_nQS' })
    firstName: string
    @ApiProperty({ example: 'ad1S_nQS' })
    lastName: string
    @ApiProperty({ example: 'ad1S_nQS' })
    city: string
    @ApiProperty({ example: 'ad1S_nQS' })
    country: string
    @ApiProperty({ example: '2024-08-30T15:06:13.310Z' })
    dateOfBirth: string
    @ApiProperty({ example: 'i am terminator' })
    aboutMe: string
    @ApiProperty({ example: 'www.image.com' })
    avatarUrl: string
    @ApiProperty({ example: '2024-08-30T15:06:13.310Z' })
    createdAt: string
    @ApiProperty({ example: 0 })
    followingCount: number
    @ApiProperty({ example: 0 })
    followersCount: number
    @ApiProperty({ example: 0 })
    publicationsCount: number
}

export class UserTypeDTOSwagger {
    @ApiProperty({ example: 0 })
    id: number
    @ApiProperty({ example: 'ad1S_nQS' })
    userName: string
    @ApiProperty({ example: 'string' })
    email: string
    @ApiProperty({ example: 'false' })
    isBlocked: boolean
}

export class UrlAvatarSwagger {
    @ApiProperty({ example: 'https://somesite.ok' })
    url: string
}

export class UpdateProfileTpeDTOSwagger {
    @ApiProperty({ example: 1 })
    count: number
}
