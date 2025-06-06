import { Switch } from '@/components/ui/switch';
import { animationDefaultOptions } from '@/lib/utils';
import { useAppStore } from '@/store';
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('react-lottie'), { ssr: false });
import { Poppins } from 'next/font/google';
import { useState } from 'react';

const poppinsFont = Poppins({
    subsets: ["latin"],
    weight: "400"
});
const EmptyChatContainer = () => {
    const { setTheme, theme } = useAppStore();
    const isDark = theme === 'dark';

    return (
        <div className={`flex-1 relative ${theme === 'dark' ? 'bg-[#1b1c24] text-white' : 'bg-white text-black'} md:flex flex-col justify-center items-center hidden transition-all`}>
            <div className={`absolute right-5 top-5 rounded-md flex items-center gap-2 p-2 ${isDark ? 'bg-gray-50' : 'bg-black'}`} >
                <Switch
                    className={isDark ? 'bg-white' : 'bg-black'}
                    checked={isDark}
                    onCheckedChange={() => setTheme(isDark ? 'light' : 'dark')}
                />
                <span className={isDark ? 'text-black' : 'text-white'}>
                    {isDark ? 'Dark Theme' : 'Light Theme'}
                </span>
            </div>

            <Lottie
                isClickToPauseDisabled={true}
                height={200}
                width={200}
                options={animationDefaultOptions}
            />
            <div className='text-opacity-80 flex flex-col justify-center items-center mt-10 lg:text-4xl text-3xl text-center'>
                <h3 className={`${poppinsFont.className}`}>
                    Hi<span className='text-purple-500'>!</span> Welcome to
                    <span className='text-purple-500'> Connectify</span>.
                </h3>
            </div>
        </div >
    )
}

export default EmptyChatContainer