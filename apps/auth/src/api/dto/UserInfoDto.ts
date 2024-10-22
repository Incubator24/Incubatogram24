import { ApiProperty } from '@nestjs/swagger'
import { ProfileTpeDTOSwagger } from '../../../../swagger/user/types'

export class UserInfoDTO {
    @ApiProperty({ example: '117' })
    id: number

    @ApiProperty({ example: 'username123' })
    userName: string

    @ApiProperty({ example: 'username123' })
    name: string

    @ApiProperty({ example: 'user@example.com' })
    email: string

    @ApiProperty({ example: '2024-09-16T10:54:21.544Z' })
    createdAt: string

    @ApiProperty({ example: '12345' })
    avatarId: number

    @ApiProperty({ example: 'true' })
    isConfirmEmail: boolean

    @ApiProperty({ type: ProfileTpeDTOSwagger })
    profile: ProfileTpeDTOSwagger
}
