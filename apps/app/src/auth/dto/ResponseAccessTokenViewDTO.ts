import { ApiProperty } from '@nestjs/swagger'

export class ResponseAccessTokenViewDTO {
    @ApiProperty()
    accessToken: string

    constructor(data: any) {
        this.accessToken = data.accessToken
    }
}
