'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMutation } from '@apollo/client'
import Image from 'next/image'
import React, { useState } from 'react'
import { INIT_SIGN_UP, INIT_LOGIN } from './graphql/mutation'
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react'
import { TbFidgetSpinner } from "react-icons/tb";
import Otp from '@/components/Otp'

export default function AuthPage() {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [userDetails, setUserDetails] = useState('')
    const [signUp, { loading: signUpLoading, error: signUpError }] = useMutation(INIT_SIGN_UP);
    const [login, { loading: loginLoading, error: loginError }] = useMutation(INIT_LOGIN);

    const handleChange = async (e: { target: { name: any; value: any } }) => {
        const { name, value } = e.target;
        if (name === 'email') {
            setUserDetails(value);
        }
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleLogin = async () => {
        if (loginLoading) return
        try {
            const { email, password } = formData
            const { data } = await login({ variables: { input: { email, password } } })

            if (data?.initLogin?.message) {
                toast(data?.initLogin?.message)
                setOtpSent(true);
                setUserDetails(email);
            } else {
                toast('Failed to send OTP')
            }
        } catch (error: any) {
            toast(`Login Error, ${error.message}`)
        }
    }

    const handleSignUp = async () => {
        if (signUpLoading) return
        const { email, password, confirmPassword } = formData
        if (password !== confirmPassword) {
            toast('Passwords do not match')
            return
        }

        try {
            const { data } = await signUp({ variables: { input: { email, password } } })

            if (data?.initSignUp?.message) {
                toast(data?.initSignUp?.message)
                setUserDetails(email);
                setOtpSent(true)
            } else {
                toast('Failed to send OTP')
            }
        } catch (error: any) {
            toast(`SignUp Error, ${error.message}`)
        }
    }


    return (
        <div className='md:h-[100vh] h-[100dvh] md:w-[100vw] w-[100dvw] flex items-center justify-center'>
            <div className='h-auto py-6 bg-white border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2'>
                <div className='flex items-center justify-center flex-col'>
                    <div className='flex flex-col items-center justify-center text-center pl-0 md:pl-20'>
                        <h1 className='text-2xl font-bold md:text-4xl font-serif'>
                            Welcome to <span className='text-purple-500 text-xl md:text-3xl'>Connectify</span>
                        </h1>
                        <Image className='w-[15rem] h-[15rem]' src={'/assets/logo.png'} alt={"logo"} width={80} height={100} />
                    </div>
                </div>
                <div className='flex items-center justify-center w-full'>
                    {otpSent ?
                        (<Otp
                            userDetails={userDetails}
                        />)
                        :
                        (<Tabs className='w-3/4' defaultValue='login'>
                            <TabsList className='bg-transparent rounded-none w-full'>
                                <TabsTrigger value='login' className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300'>Login</TabsTrigger>
                                <TabsTrigger value='signup' className='data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300'>Signup</TabsTrigger>
                            </TabsList>
                            <TabsContent value='login' className='flex flex-col gap-5 relative'>
                                <Input placeholder='Email' type='email' className='rounded-half p-6' name='email' value={formData.email} onChange={handleChange} />
                                <Input placeholder='Password' type={`${passwordVisible ? 'text' : 'password'}`} className='rounded-half p-6 relative' name='password' value={formData.password} onChange={handleChange} />
                                <Button className='rounded-half p-6 cursor-pointer'
                                    onClick={handleLogin}
                                    disabled={loginLoading}>
                                    {loginLoading ? (
                                        <span className="flex items-center gap-2"><TbFidgetSpinner className="animate-spin" /> Logging In, Please Wait! </span>) : 'Login'}
                                </Button>
                                {passwordVisible ? <Eye className='absolute right-[3%] bottom-[42%]' onClick={() => setPasswordVisible(!passwordVisible)} /> : <EyeOff className='absolute right-[3%] bottom-[42%]' onClick={() => setPasswordVisible(!passwordVisible)} />}
                            </TabsContent>
                            <TabsContent value='signup' className='flex flex-col gap-5 relative'>
                                <Input placeholder='Email' type='email' className='rounded-half p-6' name='email' value={formData.email} onChange={handleChange} />
                                <Input placeholder='Password' type={`${passwordVisible ? 'text' : 'password'}`} className='rounded-half p-6 relative' name='password' value={formData.password} onChange={handleChange} />
                                <Input placeholder='Confirm Password' type='password' className='rounded-half p-6' name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} />
                                <Button type='button' className='rounded-half p-6 cursor-pointer' onClick={handleSignUp} disabled={signUpLoading}>
                                    {signUpLoading ? (
                                        <span className="flex items-center gap-2"><TbFidgetSpinner className="animate-spin" /> Signing In, Please Wait! </span>) : 'Signup'}
                                </Button>
                                {passwordVisible ? <Eye className='absolute right-[3%] bottom-[58%]' onClick={() => setPasswordVisible(!passwordVisible)} /> : <EyeOff className='absolute right-[3%] bottom-[58%]' onClick={() => setPasswordVisible(!passwordVisible)} />}
                            </TabsContent>
                        </Tabs>)}
                </div>
            </div>
        </div>
    )
}

