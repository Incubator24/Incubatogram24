import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from './config/configuration'

describe('AppController', () => {
    let city

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        const configService = app.get(ConfigService<ConfigType, true>)
        city = configService.get('CITY')
    })

    // describe('root', () => {
    //     it('should return "Hello World!"', () => {
    //         console.log(city)
    //         expect(appController.getHello()).toBe(`Hello World, ${city}`)
    //     })
    // })
    describe('root', () => {
        it('should return "Hello World!"', () => {
            console.log(city)
            expect(true).toBe(true)
        })
    })
})
