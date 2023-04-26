import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {notFound} from "next/navigation";
import {db} from "@/lib/db";
import {fetchRedis} from "@/helpers/redis";
import {messageArraySchema} from "@/lib/validations/message";
import Messages from "@/components/Messages";
import ChatInput from "@/components/ChatInput";

type ChatProps = {
    params: {
        ChatID: string
    }
}


async function getChatMessages(ChatID: string) {
    try {
        const results: string[] = await fetchRedis(
            'zrange',
            `chat:${ChatID}:messages`,
            0,
            -1
        )

        const dbMessages = results.map((message) => JSON.parse(message) as Message)

        const reversedDbMessages = dbMessages.reverse()

        return messageArraySchema.parse(reversedDbMessages)

    } catch (error) {
        notFound()
    }
}
const page = async ({ params }: ChatProps) => {
    const { ChatID } = params
    const session = await getServerSession(authOptions)
    if (!session) notFound()

    const { user } = session

    const [userId1, userId2] = ChatID.split('--')

    if (user.id !== userId1 && user.id !== userId2) {
        notFound()
    }

    const chatPartnerId = user.id === userId1 ? userId2 : userId1
    // new

    const chatPartnerRaw = (await fetchRedis(
        'get',
        `user:${chatPartnerId}`
    )) as string
    const chatPartner = JSON.parse(chatPartnerRaw) as User
    const initialMessages = await getChatMessages(ChatID)

    return (
        <div className="flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-4rem)]">
            <div className={"flex sm:items-center justify-between py-5 border-b-2 border-gray-500"}>
                    <div className={"flex flex-col leading-tight"}>
                        <div className={"text-md ml-8 flex items-center"}>
                            <span className={"text-gray-50 font-medium"}>{chatPartner.email}</span>
                        </div>
                    </div>
            </div>

            <Messages ChatID={ChatID}
                      chatPartner={chatPartner}
                      sessionId={session.user.id}
                      initialMessages={initialMessages} />
            <ChatInput chatPartner={chatPartner} ChatID={ChatID}/>
        </div>
    )
}

export default page
