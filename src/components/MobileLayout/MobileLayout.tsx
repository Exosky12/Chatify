'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {Menu, X} from 'lucide-react'
import Link from "next/link";
import {Icons} from "@/components/Icons";
import { Session } from 'next-auth'
import { SidebarOption } from '@/types/global'
import { usePathname } from 'next/navigation'
import {Button, buttonVariants} from "@/components/ui/Button";
import FriendRequestsSideBarOptions from "@/components/FriendRequestsSideBarOptions";
import SignOutButton from "@/components/SignOutButton";
import ChatList from "@/components/ChatList";

type MobileChatLayoutProps = {
    friends: User[],
    session: Session,
    sidebarOptions: SidebarOption[],
    unseenRequestCount: number
}

const MobileLayout = ({ friends, session, sidebarOptions, unseenRequestCount }: MobileChatLayoutProps) => {
    const [open, setOpen] = useState<boolean>(false)

    const pathname = usePathname()

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <div className='fixed bg-neutral-950 top-0 inset-x-0 p-4'>
            <div className='w-full flex justify-between items-center'>
                <Link
                    href='/dashboard'
                    className={buttonVariants({ variant: 'ghost' })}>
                </Link>
                <Button onClick={() => setOpen(true)} className='gap-4'>
                    Menu <Menu className='h-6 w-6' />
                </Button>
            </div>
            <Transition.Root show={open} as={Fragment}>
                <Dialog as='div' className='relative z-10' onClose={setOpen}>
                    <div className='fixed inset-0 ' />

                    <div className='fixed inset-0 overflow-hidden'>
                        <div className='absolute inset-0 overflow-hidden'>
                            <div className='pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10'>
                                <Transition.Child
                                    as={Fragment}
                                    enter='transform transition ease-in-out duration-500 sm:duration-700'
                                    enterFrom='-translate-x-full'
                                    enterTo='translate-x-0'
                                    leave='transform transition ease-in-out duration-500 sm:duration-700'
                                    leaveFrom='translate-x-0'
                                    leaveTo='-translate-x-full'>
                                    <Dialog.Panel className='pointer-events-auto w-screen max-w-md'>
                                        <div className='flex h-full flex-col overflow-hidden bg-neutral-950 py-6 shadow-xl'>
                                            <div className='px-4 sm:px-6'>
                                                <div className='flex items-start justify-between'>
                                                    <Dialog.Title className='text-base font-semibold leading-6 text-gray-50'>
                                                        Chatify
                                                    </Dialog.Title>
                                                    <div className='ml-3 flex h-7 items-center'>
                                                        <button
                                                            type='button'
                                                            className='rounded-md bg-neutral-950 text-gray-400 hover:text-gray-50 focus:outline-none'
                                                            onClick={() => setOpen(false)}>
                                                            <span className='sr-only'>Navigation</span>
                                                            <X className='h-6 w-6' aria-hidden='true' />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='relative mt-6 flex-1 px-4 sm:px-6'>

                                                <nav className='flex flex-1 flex-col'>
                                                    <ul
                                                        role='list'
                                                        className='flex flex-1 flex-col gap-y-7'>
                                                        <li>
                                                            <ChatList
                                                                friends={friends}
                                                                sessionId={session.user.id}
                                                            />
                                                        </li>

                                                        <li>
                                                            <div className='text-xs font-semibold leading-6 text-gray-400'>
                                                                Vue globale
                                                            </div>
                                                            <ul role={"list"} className={"-mx-2 mt-2 space-y-1"}>
                                                                {sidebarOptions.map((option) => {
                                                                    const Icon = Icons[option.Icon]
                                                                    return (
                                                                        <li key={option.id}>
                                                                            <Link
                                                                                href={option.href}
                                                                                className='hover:text-[#10A37F] hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'>
									<span className='text-gray-400 border-gray-200 group-hover:border-[#10A37F] group-hover:text-[#10A37F] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
								  <Icon className='h-6 w-6 ml-1' />
								</span>

                                                                                <span className='truncate mt-0.5'>{option.name}</span>
                                                                            </Link>
                                                                        </li>
                                                                    )
                                                                })}
                                                                <li>
                                                                    <FriendRequestsSideBarOptions sessionId={session.user.id} initialUnseenRequestCount={unseenRequestCount} />
                                                                </li>
                                                            </ul>
                                                        </li>

                                                        <li className={"-mx-6 mt-auto flex items-center"}>
                                                            <div className="flex flex-1 items-center gap-x-4 px-6 py-6 text-sm font-semibold leading-6">
                                                                <div className='flex flex-1 items-center gap-x-4 py-3 text-sm font-semibold leading-6'>
                                                                    <div className='flex flex-col'>
												<span className='text-md font-normal' aria-hidden='true'>
													{session.user.email}
												</span>
                                                                    </div>
                                                                </div>

                                                                <SignOutButton className='h-full aspect-square' />
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    )
}

export default MobileLayout