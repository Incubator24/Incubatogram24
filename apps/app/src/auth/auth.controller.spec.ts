import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from './auth.module'
import { AuthController } from './auth.controller'

describe('AuthController', () => {
    let authController: AuthController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        }).compile()

        authController = app.get<AuthController>(AuthController)
    })

    describe('root', () => {
        it('should return registration User"', () => {
            expect(authController.getHello()).toBe('Hello World, Moscow')
        })
    })
})
