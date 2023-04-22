import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { ReactNode } from 'react';
import { Icons, Icon } from "@/components/Icons";
import SignOutButton from "@/components/SignOutButton";
import FriendRequestsSideBarOptions from "@/components/FriendRequestsSideBarOptions";
import {fetchRedis} from "@/helpers/redis";
import {getFriendsByUserId} from "@/helpers/getFriendsByUserId";
import ChatList from "@/components/ChatList";
import MobileLayout from "@/components/MobileLayout/MobileLayout";
import Image from "next/image";

type LayoutProps = {
	children: ReactNode;
};

type sideBarOption = {
	id: number,
	name: string,
	href: string,
	Icon: Icon
}

const sidebarOptions: sideBarOption[] = [
	{
		id: 1,
		name: 'Ajouter un ami',
		href: '/dashboard/add',
		Icon: 'UserPlus',
	},
]
const Layout = async ({ children }: LayoutProps) => {
	const session = await getServerSession(authOptions);
	if (!session) notFound();

	const friends = await getFriendsByUserId(session.user.id);

	const unseenRequestCount = (
		(await fetchRedis(
			'smembers',
			`user:${session.user.id}:incoming_friend_requests`
		)) as User[]
	).length

	return (
		<>
			{friends.length > 0 ? (

				<div className='w-full flex h-screen'>
					<div className={"md:hidden"}>
						<MobileLayout
							friends={friends}
							session={session}
							sidebarOptions={sidebarOptions}
							unseenRequestCount={unseenRequestCount} />
					</div>
							<div className='hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto bg-neutral-950 px-6'>
								<Link href={'/dashboard'} className="flex h-8 mt-12 shrink-0 items-center">
									<Image
										src="/logo.png"
										alt="Chatify logo"
										width={500}
										height={500}
									/>
								</Link>

								<nav className="flex flex-1 flex-col">
									<ul role={"list"} className={"flex flex-1 flex-col gap-y-7"}>
										<li><ChatList sessionId={session.user.id} friends={friends} /></li>
										<li>
											<div className={"text-xs font-semibold leading-6 text-gray-400"}>Vue globale</div>
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
						{children}
				</div>

			): (

				<div className='w-full flex h-screen'>
					<div className={"md:hidden"}>
						<MobileLayout
							friends={friends}
							session={session}
							sidebarOptions={sidebarOptions}
							unseenRequestCount={unseenRequestCount}/>
					</div>
					<div className='hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto bg-neutral-950 px-6'>
						<Link href={'/dashboard'} className="flex h-12 mt-12 shrink-0 items-center">
							<Image
								src="logo.png"
								alt="Chatify logo"
								width={500}
								height={500}
							/>
						</Link>

						<nav className="flex mt-2 flex-1 flex-col">
							<ul role={"list"} className={"flex flex-1 flex-col gap-y-7"}>
								<li><ChatList sessionId={session.user.id} friends={friends} /></li>
								<li>
									<div className={"text-xs font-semibold leading-6 text-gray-400"}>Vue globale</div>
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
					{children}
				</div>

			)}
		</>
	);
};

export default Layout;