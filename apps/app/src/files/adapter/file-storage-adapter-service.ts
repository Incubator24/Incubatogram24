import { Injectable } from '@nestjs/common'
import {
    DeleteObjectCommand,
    PutObjectCommand,
    PutObjectCommandOutput,
    S3Client,
} from '@aws-sdk/client-s3'
import Configuration from '../../config/configuration'
import { UserRepository } from '../../user/user.repository'

@Injectable()
export class S3StorageAdapter {
    s3Client: S3Client

    constructor(public userRepository: UserRepository) {
        const REGION = 'eu-north-1'
        this.s3Client = new S3Client({
            region: REGION,
            endpoint: Configuration.getConfiguration().YANDEX_S3_ENDPOINT,
            credentials: {
                secretAccessKey:
                    Configuration.getConfiguration().YANDEX_S3_SECRET_KEY,
                accessKeyId: Configuration.getConfiguration().YANDEX_S3_KEY_ID,
            },
        })
    }

    async saveAvatar(
        userId: number,
        originalName: string,
        mimetype: string,
        buffer: Buffer
    ) {
        if (!['image/png', 'image/jpeg'].includes(mimetype)) {
            throw new Error(
                'Unsupported file type. Only PNG and JPEG are allowed.'
            )
        }

        const extension = mimetype.split('/')[1]
        const key = `content/users/${userId}/avatars/${userId}_avatar.${extension}`
        const bucketParams = {
            Bucket: Configuration.getConfiguration().YANDEX_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
        }

        const command = new PutObjectCommand(bucketParams)

        try {
            const uploadResult: PutObjectCommandOutput =
                await this.s3Client.send(command)

            return {
                url: key,
                fileId: uploadResult.ETag,
            }
        } catch (err) {
            console.error('Error uploading avatar:', err)
            throw err
        }
    }

    async deleteAvatar(userId: number) {
        const currentUserInfo = await this.userRepository.findUserById(userId)
        if (!currentUserInfo) {
            return false
        }

        const bucketParams = {
            Bucket: Configuration.getConfiguration().YANDEX_S3_BUCKET_NAME,
            Key: currentUserInfo.avatarId,
        }

        const command = new DeleteObjectCommand(bucketParams)

        try {
            const data = await this.s3Client.send(command)
            console.log(data)
            return data
        } catch (exeption) {
            console.error('Exeption', exeption)
            throw exeption
        }
    }
}
