import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {notFound} from "next/navigation";
import {fetchRedis} from "@/helpers/redis";
import FriendRequests from "@/components/FriendRequests";

const page = async ({}) => {
    const session = await getServerSession(authOptions)
    if(!session) notFound()

    const incomingSendersId = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[];

    const incomingFriendRequests = await Promise.all(incomingSendersId.map(async (senderId) => {
        const sender = await fetchRedis('get', `user:${senderId}`) as string;
        const senderParsed = JSON.parse(sender) as User
        return {
            senderId,
            senderEmail: senderParsed.email
        }
    }))
    return (
        <main className="mt-56 m-auto">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <h1 className={'font-bold text-2xl lg:text-5xl mb-8'}>Vos demandes d'amis</h1>
            <div className={'flex flex-col gap--4'}>
                <FriendRequests sessionId={session.user.id} incomingFriendRequests={incomingFriendRequests}/>
            </div>
        </main>
    )
}

export default page