'use client'
import { useAppStore } from '@/store';
import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useLazyQuery } from '@apollo/client';
import { GET_MESSAGES } from '../../../../graphql/query';
import Image from 'next/image';
import { MdFolderZip } from 'react-icons/md'
import { IoMdArrowRoundDown } from 'react-icons/io'
import { IoCloseSharp } from 'react-icons/io5';
import axios from 'axios';

function MessageContainer() {
    const {
        selectedChatType,
        selectedChatData,
        userInfo,
        selectedChatMessages,
        setSelectedChatMessages,
        setUserInfo,
        setFileDownloadProgress,
        setIsDownloading
    } = useAppStore();
    const [showImage, setShowImage] = useState(false);
    const [imageURL, setImageUrl] = useState(null);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [fetchMessages, { data: fetchedMessages }] = useLazyQuery(GET_MESSAGES);

    const checkIfImage = (filePath: any) => {
        const imageRegex = /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i;
        return imageRegex.test(filePath);
    }


    const downloadFile = async (fileUrl: string) => {
        try {
            setIsDownloading(true);
            setFileDownloadProgress(0);

            // Replace /uploads/... with /api/download/...
            const fileName = fileUrl.split('/').pop();
            const downloadUrl = `http://localhost:8080/api/download/${fileName}`;

            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
                onDownloadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;
                    if (total) {
                        const percentCompleted = Math.round((loaded * 100) / total);
                        setFileDownloadProgress(percentCompleted);
                    }
                }
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'download';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
            setFileDownloadProgress(0);
        }
    };





    const getMessages = async () => {
        try {
            if (selectedChatData?.id) {
                fetchMessages({
                    variables: {
                        input: {
                            senderId: selectedChatData.id,
                        },
                    },
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (fetchedMessages?.getMessage) {
            setSelectedChatMessages(fetchedMessages.getMessage);
        }
    }, [fetchedMessages, setSelectedChatMessages]);

    useEffect(() => {
        if (selectedChatData?.id && selectedChatType === 'contact') {
            getMessages();
        }
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [selectedChatData, selectedChatType, selectedChatMessages]);

    const renderDMMessages = (message) => {
        const isSender = message?.senderId === userInfo?.id;
        const messageClass = isSender
            ? 'bg-[#8417ff]/5 text-[#8417ff] border-[#8417ff]/50'
            : 'bg-[#2a2b33]/5 text-white/80 border-white/50';

        return (
            <div className={`my-1 ${isSender ? 'text-right' : 'text-left'}`}>
                {message.messageType === 'text' && (
                    <div className={`border inline-block p-4 max-w-[50%] break-words rounded-xs ${messageClass}`}>
                        {message.content}
                    </div>
                )}
                {(message.messageType === 'file' || message.messageType === 'image' || message.messageType === 'video') && (
                    <div className={`border inline-block p-4 max-w-[50%] break-words rounded-xs ${messageClass}`}>
                        {checkIfImage(message.fileUrl) ? (
                            <div
                                className='cursor-pointer'
                                onClick={() => {
                                    setShowImage(true);
                                    setImageUrl(message?.fileUrl);
                                }}
                            >
                                <Image src={message.fileUrl} alt="Image" height={300} width={300} />
                            </div>
                        ) : (
                            <div className='flex justify-center items-center gap-3'>
                                <span className='text-white/80 text-3xl bg-black/20 rounded-full p-3'>
                                    <MdFolderZip />
                                </span>
                                <span>{message?.fileUrl?.split("/").pop() ?? 'Unknown File'}</span>
                                <span
                                    className='bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300'
                                    onClick={() => downloadFile(message.fileUrl)}
                                >
                                    <IoMdArrowRoundDown />
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className='text-xs text-gray-600'>
                    {moment(message.createdAt).format('LT')}
                </div>
            </div >
        );
    };

    const renderMessages = () => {
        let lastDate = '';
        return selectedChatMessages?.map((message, index) => {
            const messageDate = moment(message.createdAt).format('YYYY-MM-DD');
            const showDate = messageDate !== lastDate;
            lastDate = messageDate;

            return (
                <div key={message.id}>
                    {showDate && (
                        <div className='text-center text-gray-500 my-2'>
                            {moment(message.createdAt).format('LL')}
                        </div>
                    )}
                    {selectedChatType === 'contact' && renderDMMessages(message)}
                </div>
            );
        });
    };

    return (
        <div className='flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full'>
            {renderMessages()}
            <div ref={scrollRef}>
                {showImage && <div className='fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg'>
                    <div>
                        <Image src={`${imageURL}`} alt="Image View" width={300} height={300} className='h-[80vh] w-full bg-cover rounded-xl' />
                    </div>
                    <div className='flex gap-5 fixed top-0 mt-5'>
                        <button className='bg-white/10 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => downloadFile(imageURL)}>
                            <IoMdArrowRoundDown />
                        </button>
                        <button className='bg-white/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => { setShowImage(false); setImageUrl(null) }}>
                            <IoCloseSharp />
                        </button>
                    </div>
                </div>}
            </div>
        </div>
    );
}

export default MessageContainer;
