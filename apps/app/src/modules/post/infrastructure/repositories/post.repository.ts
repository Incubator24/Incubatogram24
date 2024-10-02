import { Injectable } from '@nestjs/common'
import { IPostRepository } from '../interfaces/post.repository.interface'
import { PrismaService } from '../../../../../../../prisma/prisma.service'

@Injectable()
export class PostRepository implements IPostRepository {
    constructor(private prisma: PrismaService) {}
}
