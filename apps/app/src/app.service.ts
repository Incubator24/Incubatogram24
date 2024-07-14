import { Injectable } from '@nestjs/common'
import Configuration from './config/configuration'

@Injectable()
export class AppService {
    constructor() {}

    getHello(): string {
        console.log(Configuration.getConfiguration().DATABASE_URL)
        return 'Hello World, ' + `${Configuration.getConfiguration().CITY}`
    }

    sayGoodbay(): string {
        return 'Goodbay,  World 123456'
    }
}
