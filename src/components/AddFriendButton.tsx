'use client'

import { addFriendValidator } from '@/lib/validations/add-friend'
import axios, { AxiosError } from 'axios'
import React, { FC, useState } from 'react'
import { z } from 'zod'
import {Button} from "@/components/ui/Button";
import {toast} from "react-hot-toast";

const AddFriendButton = () => {
    const [showSuccessState, setShowSuccessState] = useState<boolean>(false)

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (!event) return
        event.preventDefault()

        const data = new FormData(event.currentTarget)
        const email = String(data.get('email'))
        onSubmit(email)
    }
    const addFriend = async (email: string) => {
        try {
            const validatedEmail = addFriendValidator.parse({ email })

            await axios.post('/api/friends/add', {
                email: validatedEmail,
            })
            setShowSuccessState(true)

        } catch (error) {
            setShowSuccessState(false)

            if (email === '') {
                toast.error('Veuillez entrer un email')
                return
            }

            if (error instanceof z.ZodError) {
                toast.error('Veuillez entrer un email valide')
                return
            }

            if (error instanceof AxiosError) {
                toast.error(error.response?.data)
                return
            }

            toast.error('Une erreur est survenue')
        }
    }

    const onSubmit = (email: string) => {
        addFriend(email)
    }

    if(showSuccessState) setShowSuccessState(false)

    return (
        <form onSubmit={(event) => handleSubmit(event)} className='w-[80vw] m-auto md:w-[50vw]'>
            <label
                htmlFor='email'
                className='block text-sm font-medium leading-6'>
                Ajouter un ami avec son e-mail
            </label>

            <div className='mt-2 flex flex-col gap-4'>
                <input
                    name='email'
                    type='text'
                    className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#10A37F] sm:text-sm sm:leading-6'
                    placeholder='toi@example.com'
                />
                <Button>Ajouter</Button>
            </div>
            {showSuccessState ? (
                toast.success('Demande d\'ami envoyée')
            ) : null}
        </form>
    )
}

export default AddFriendButton