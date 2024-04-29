import { Injectable } from '@nestjs/common'
import * as process from 'process'

@Injectable()
export class AppService {
    getHello(): string {
        return 'Hello World!'
    }
    getHelloCity(): string {
        return 'Hello World, ' + `${process.env.CITY}`
    }

    sayGoodbay(): string {
        return 'Goodbay,  World 1234'
    }
}
