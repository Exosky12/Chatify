'use client'

import { cn, toPusherKey } from '@/lib/utils'
import { pusherClient } from '@/lib/pusher'
import { Message } from '@/lib/validations/message'
import { format } from 'date-fns'
import { useRef, useState, useEffect } from 'react'

type MessagesProps = {
    initialMessages: Message[]
    sessionId: string
    ChatID: string
    chatPartner: User
}

const Messages = ({ initialMessages, sessionId, ChatID }: MessagesProps) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages)

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`chat:${ChatID}`)
        )

        const messageHandler = (message: Message) => {
            setMessages((prev) => [message, ...prev])
        }

        pusherClient.bind('incoming-message', messageHandler)

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`chat:${ChatID}`)
            )
            pusherClient.unbind('incoming-message', messageHandler)
        }
    }, [ChatID])

    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    const formatTimestamp = (timestamp: number) => {
        return format(timestamp, 'HH:mm')
    }

    return (
        <div
            id='messages'
            className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
            <div ref={scrollDownRef} />

            {messages.map((message, index) => {
                const isCurrentUser = message.senderId === sessionId

                const hasNextMessageFromSameUser =
                    messages[index - 1]?.senderId === messages[index].senderId

                return (
                    <div
                        className='chat-message'
                        key={`${message.id}-${message.timestamp}`}>
                        <div
                            className={cn('flex items-end', {
                                'justify-end': isCurrentUser,
                            })}>
                            <div
                                className={cn(
                                    'flex flex-col space-y-2 text-base max-w-xs mx-2',
                                    {
                                        'order-1 items-end': isCurrentUser,
                                        'order-2 items-start': !isCurrentUser,
                                    }
                                )}>
                <span
                    className={cn('px-4 py-2 rounded-lg inline-block lg:max-w-[50vw] md:max-w-[70vw] overflow-hidden break-words', {
                        'bg-[#10A37F] text-white': isCurrentUser,
                        'bg-indigo-600 text-white': !isCurrentUser,
                        'rounded-br-none':
                            !hasNextMessageFromSameUser && isCurrentUser,
                        'rounded-bl-none':
                            !hasNextMessageFromSameUser && !isCurrentUser,
                    })}>
                  {message.text}{' '}
                    <span className='ml-2 text-xs text-gray-50'>
                        {formatTimestamp(message.timestamp)}
                  </span>
                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Messages