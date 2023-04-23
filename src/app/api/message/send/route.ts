import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {fetchRedis} from "@/helpers/redis";
import {db} from "@/lib/db";
import {nanoid} from "nanoid";
import {messageSchema} from "@/lib/validations/message";
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'

type props = {
    text: string,
    ChatID: string
}
export async function POST(req: Request){
    try {
        const {text, ChatID}: props = await req.json()
        const session = await getServerSession(authOptions)

        if(!session) return new Response('Non autorisé', {status: 401})

        const [userId1, userId2] = ChatID.split('--')

        if(session.user.id !== userId1 && session.user.id !== userId2) return new Response('Non autorisé', {status: 401})

        const friendID = session.user.id === userId1 ? userId2 : userId1

        const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[]
        const isFriend = friendList.includes(friendID)

        if(!isFriend) return new Response('Non autorisé', {status: 401})

        const unParsedSender = await fetchRedis('get', `user:${session.user.id}`) as string
        const parsedSender = JSON.parse(unParsedSender) as User

        const timestamp = Date.now()

        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text: text,
            receiverId: friendID,
            timestamp: Date.now(),
        }
        const message = messageSchema.parse(messageData)

        await pusherServer.trigger(toPusherKey(`chat:${ChatID}`), 'incoming-message', message)

        await pusherServer.trigger(toPusherKey(`user:${friendID}:chats`), 'new_message', {
            ...message,
            senderEmail: parsedSender.email
        })

        await db.zadd(`chat:${ChatID}:messages`, {
            score: timestamp,
            member: JSON.stringify(message)
        })

        return new Response('OK', {status: 200})
    } catch (error) {
        if(error instanceof Error) return new Response(error.message, {status: 500})

        return new Response('Erreur serveur', {status: 500})
    }
}