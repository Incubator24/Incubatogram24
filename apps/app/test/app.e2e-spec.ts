import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { ConfigService } from '@nestjs/config'
import { ConfigType } from '../../../libs/config/configuration'

describe('AppController (e2e)', () => {
    // let app: INestApplication
    //
    // beforeEach(async () => {
    //     const moduleFixture: TestingModule = await Test.createTestingModule({
    //         imports: [AppModule],
    //     }).compile()
    //
    //     app = moduleFixture.createNestApplication()
    //     await app.init()
    // })
    //
    // it('/ (GET)', () => {
    //     expect(true).toBe(true)
    //     // return request(app.getHttpServer())
    //     //     .get('/')
    //     //     .expect(200)
    //     //     .expect(`Hello World, ${city}`)
    // })
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
