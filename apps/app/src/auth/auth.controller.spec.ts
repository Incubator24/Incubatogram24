import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from './auth.module'
import { AuthController } from './auth.controller'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../config/configuration'

describe('AuthController', () => {
    let authController: AuthController
    let city

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        }).compile()

        const configService = app.get(ConfigService<ConfigType, true>)
        city = configService.get('CITY')
        authController = app.get<AuthController>(AuthController)
    })

    describe('root', () => {
        it('should return registration User"', () => {
            expect(authController.getHello()).toBe(`Hello World, ${city}`)
        })
    })
})
