import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './config/configuration'

describe('AppController', () => {
    let appController: AppController
    let city

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        const configService = app.get(ConfigService<ConfigType, true>)
        city = configService.get('CITY')
        appController = app.get<AppController>(AppController)
    })

    describe('root', () => {
        it('should return "Hello World!"', () => {
            console.log(city)
            expect(appController.getHello()).toBe(`Hello World, ${city}`)
        })
    })
})
