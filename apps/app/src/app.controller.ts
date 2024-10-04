import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'
import { SwaggerDefaultEndpoint } from './swagger/Internal/swaggerDefaultEndpoint'

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @SwaggerDefaultEndpoint()
    getHello(): string {
        return this.appService.getHello()
    }
}
