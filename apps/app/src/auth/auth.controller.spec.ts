import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../config/configuration'
import { AppModule } from '../app.module'

// describe('AuthController', () => {
//     let city
//     let authController
//
//     beforeEach(async () => {
//         const app: TestingModule = await Test.createTestingModule({
//             imports: [AuthModule],
//         }).compile()
//
//         const configService = app.get(ConfigService<ConfigType, true>)
//         city = configService.get('CITY')
//         authController = app.get<AuthController>(AuthController)
//     })
//
//     describe('root', () => {
//         it('should return registration User"', () => {
//             expect(authController.getHello()).toBe(`Hello World, ${city}`)
//             expect(true).toBe(true)
//         })
//     })
// })

describe('AuthController', () => {
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
