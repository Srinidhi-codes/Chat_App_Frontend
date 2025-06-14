'use client'
import { useAppStore } from '@/store'
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner';
import ContactsContainer from './components/contacts-container';
import EmptyChatContainer from './components/empty-chat-container';
import ChatContainer from './components/chat-container';

export default function ChatPage() {

    const { userInfo, selectedChatType, isUploading, isDownloading, fileUploadProgress, fileDownloadProgress, } = useAppStore();
    const router = useRouter();
    const hasRedirected = useRef(false);
    useEffect(() => {
        if (
            userInfo?.profileSetup === false &&
            !hasRedirected.current
        ) {
            hasRedirected.current = true;
            toast('Please first setup profile to continue.');
            router.push('/profile');
        }
    }, [userInfo, router]);
    return (
        <div className='flex h-[100dvh] md:h-[100vh] text-white overflow-hidden'>
            {isUploading && <div className='h-[100vh] md:w-[100vw] w-[100dvw]  fixed top-0 z-50 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg'>
                <h5 className='text-5xl animate-pulse'> Uploading File</h5>
                {fileUploadProgress}%
            </div>}
            {isDownloading && <div className='h-[100vh] md:w-[100vw] w-[100dvw]  fixed top-0 z-50 left-0 bg-black/80 flex items-center justify-center flex-col gap-5 backdrop-blur-lg'>
                <h5 className='text-5xl animate-pulse'> Downloading File</h5>
                {fileDownloadProgress}%
            </div>}
            <ContactsContainer />
            {selectedChatType === undefined ?
                (<EmptyChatContainer />) : (<ChatContainer />)
            }
        </div>
    )
}

