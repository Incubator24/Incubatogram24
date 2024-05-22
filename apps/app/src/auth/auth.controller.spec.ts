import { Test, TestingModule } from '@nestjs/testing'
import { AuthModule } from './auth.module'
import { AppController } from '../app.controller'

describe('AppController', () => {
    let appController: AppController

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            imports: [AuthModule],
        }).compile()

        appController = app.get<AppController>(AppController)
    })

    describe('root', () => {
        it('should return registration User"', () => {
            expect(appController.getHello()).toBe('Hello World, Moscow')
        })
    })
})
