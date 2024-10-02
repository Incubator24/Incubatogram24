// github.service.ts
import { Injectable } from '@nestjs/common'
import axios from 'axios'
import Configuration from '../../../config/configuration'

@Injectable()
export class GithubService {
    async validate(code: string) {
        const requestData = {
            code,
            client_id: Configuration.getConfiguration().GITHUB_CLIENT_ID,
            client_secret:
                Configuration.getConfiguration().GITHUB_CLIENT_SECRET,
        }

        const resp = await axios.post(
            'https://github.com/login/oauth/access_token',
            requestData,
            {
                headers: { Accept: 'application/json' },
            }
        )

        if ('error' in resp.data) {
            console.error('-> error', resp.data)
            throw new Error(resp.data.error)
        }

        return resp.data
    }

    async getGithubUserByToken(token: any) {
        const response = await Promise.all([
            axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${token.access_token}`,
                },
            }),
            axios.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `token ${token.access_token}`,
                },
            }),
        ])

        const user = response[0].data
        const { email } = response[1].data.find(
            (emailObj: any) => emailObj.primary
        )

        return {
            user: user,
            avatar_url: user.avatar_url,
            name: user.name,
            email,
        }
    }
}
