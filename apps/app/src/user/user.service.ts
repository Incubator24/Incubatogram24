import { Injectable } from '@nestjs/common'
import { ProviderType, User } from '@prisma/client'
import { PrismaService } from '../../../../prisma/prisma.service'
import { UserRepository } from './user.repository'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private userRepository: UserRepository
    ) {}

    async findByProviderId(
        providerId: string,
        provider: string
    ): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: {
                accounts: {
                    some: {
                        providerId,
                        type: provider.toUpperCase() as ProviderType,
                    },
                },
            },
        })
    }

    async createOAuthUser(profile: any, provider: string): Promise<User> {
        const foundUserByEmail = await this.userRepository.findUserByEmail(
            profile.emails[0].value
        )
        let userName = profile.displayName
        if (!profile.displayName) {
            userName = await this.makeUniqueUserName(
                'user',
                this.userRepository
            )
        }

        const isUniqueUserName =
            await this.userRepository.findUserByLoginOrEmail(
                profile.displayName
            )
        if (isUniqueUserName) {
            userName = await this.makeUniqueUserName(
                profile.displayName,
                this.userRepository
            )
        }

        if (!foundUserByEmail) {
            return this.prisma.user.create({
                data: {
                    userName: userName,
                    email: profile.emails[0].value,
                    confirmed: true,
                    accounts: {
                        create: {
                            providerId: profile.id,
                            email: profile.emails[0].value,
                            userName: profile.username || profile.displayName,
                            type: provider.toUpperCase() as ProviderType,
                        },
                    },
                },
            })
        }

        await this.prisma.providers.create({
            data: {
                userId: foundUserByEmail.id,
                providerId: profile.id,
                email: profile.emails[0].value,
                userName: userName,
                type: provider.toUpperCase() as ProviderType,
            },
        })
        return foundUserByEmail
    }
    async makeUniqueUserName(
        displayName: string,
        userRepository: UserRepository
    ): Promise<string> {
        let userName = displayName
        let suffix = 1

        while (await userRepository.findUserByLoginOrEmail(userName)) {
            userName = `${displayName}${suffix}`
            suffix++
        }

        return userName
    }
}
