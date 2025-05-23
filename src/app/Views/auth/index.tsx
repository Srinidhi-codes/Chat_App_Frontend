'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMutation } from '@apollo/client'
import Image from 'next/image'
import React, { useState } from 'react'
import { LOG_IN, SIGN_UP } from './graphql/mutation'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner';
import { useAppStore } from '@/store'

export default function AuthPage() {
    const router = useRouter();
    const { setUserInfo } = useAppStore();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [signUp] = useMutation(SIGN_UP);
    const [login] = useMutation(LOG_IN);

    const handleChange = async (e: { target: { name: any; value: any } }) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleLogin = async () => {
        try {
            const { email, password } = formData;
            const { data } = await login({
                variables: {
                    input: {
                        email,
                        password
                    }
                }
            });
            setUserInfo(data.login)
            localStorage.setItem("token", data.login.token);
            toast("Login Success");
            router.push('/chat');
        } catch (error: any) {
            toast(`${error.message}`);
        }
    }
    const handleSignUp = async () => {
        try {
            const { email, password, confirmPassword } = formData;
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            const { data } = await signUp({
                variables: {
                    input: {
                        email,
                        password
                    }
                }
            });
            setUserInfo(data.signUp);
            localStorage.setItem("token", data.signUp.token);
            toast("SignUp Success");
            router.push('/chat');
        } catch (error: any) {
            toast(`SignUp Error, ${error.message}`);
        }
    };

    return (
        <div className='h-[100vh] w-[100vw] flex items-center justify-center'>
            <div className='h-[80vh] bg-white border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2'>
                <div className='flex items-center justify-center flex-col'>
                    <div className='flex flex-col items-center justify-center text-center pl-0 md:pl-20'>
                        <h1 className='text-2xl font-bold md:text-4xl font-serif'>
                            Welcome to <span className='text-purple-500 text-xl md:text-3xl'>Connectify</span>
                        </h1>
                        <Image className='w-[20rem] h-[20rem]' src={'/assets/logo.png'} alt={"logo"} width={100} height={100} />
                    </div>
                </div>
                <div className='flex items-center justify-center w-full'>
                    <Tabs className='w-3/4' defaultValue='login'>
                        <TabsList className='bg-transparent rounded-none w-full'>
                            <TabsTrigger value='login' className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300'>Login</TabsTrigger>
                            <TabsTrigger value='signup' className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300'>Signup</TabsTrigger>
                        </TabsList>
                        <TabsContent value='login' className='flex flex-col gap-5'>
                            <Input placeholder='Email' type='email' className='rounded-half p-6' name='email' value={formData.email} onChange={handleChange} />
                            <Input placeholder='Password' type='password' className='rounded-half p-6' name='password' value={formData.password} onChange={handleChange} />
                            <Button className='rounded-half p-6' onClick={handleLogin}>Login</Button>
                        </TabsContent>
                        <TabsContent value='signup' className='flex flex-col gap-5'>
                            <Input placeholder='Email' type='email' className='rounded-half p-6' name='email' value={formData.email} onChange={handleChange} />
                            <Input placeholder='Password' type='password' className='rounded-half p-6' name='password' value={formData.password} onChange={handleChange} />
                            <Input placeholder='Confirm Password' type='password' className='rounded-half p-6' name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} />
                            <Button className='rounded-half p-6' onClick={handleSignUp}>Sign Up</Button>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

