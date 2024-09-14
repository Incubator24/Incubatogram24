import { Module } from '@nestjs/common'
import { PostController } from './api/post.controller'
import { CommandBus } from '@nestjs/cqrs'

@Module({
    imports: [],
    controllers: [PostController],
    providers: [CommandBus],
    exports: [],
})
export class PostModule {}
