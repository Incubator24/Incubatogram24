// github.service.ts
import { Injectable } from '@nestjs/common'
import axios from 'axios'
import Configuration from '../../../config/configuration'

@Injectable()
export class GithubService {
    async validate(code: string) {
        const requestData = {
            code: code,
            client_id: Configuration.getConfiguration().GITHUB_CLIENT_ID,
            client_secret:
                Configuration.getConfiguration().GITHUB_CLIENT_SECRET,
            redirect_url: Configuration.getConfiguration().GITHUB_CALLBACK_URL,
        }
        console.log(
            'code = ',
            Configuration.getConfiguration().GITHUB_CLIENT_ID
        )
        console.log(
            'clientt = ',
            Configuration.getConfiguration().GITHUB_CLIENT_SECRET
        )
        console.log('code = ', code)
        try {
            const resp = await axios.post(
                'https://github.com/login/oauth/access_token',
                requestData,
                {
                    headers: { Accept: 'application/json' },
                }
            )
            //console.log('resp = ', resp)

            if ('error' in resp.data) {
                console.error('-> error', resp.data)
                throw new Error(resp.data.error)
            }
            return resp.data
        } catch (e) {
            console.log(e)
        }
        // const resp = await axios.post(
        //     'https://github.com/login/oauth/access_token',
        //     requestData,
        //     {
        //         headers: { Accept: 'application/json' },
        //     }
        // )
        // //console.log('resp = ', resp)
        //
        // if ('error' in resp.data) {
        //     console.error('-> error', resp.data)
        //     throw new Error(resp.data.error)
        // }

        // return resp.data
    }

    async getGithubUserByToken(token: any) {
        const response = await Promise.all([
            axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                },
            }),
            axios.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                },
            }),
        ])

        const user = response[0].data
        const { email } = response[1].data.find(
            (emailObj: any) => emailObj.primary
        )
        console.log('user = ', user)
        return {
            id: user.id,
            email: email,
        }
        // return {
        //     user: user,
        //     avatar_url: user.avatar_url,
        //     name: user.name,
        //     email,
        // }
    }
}
