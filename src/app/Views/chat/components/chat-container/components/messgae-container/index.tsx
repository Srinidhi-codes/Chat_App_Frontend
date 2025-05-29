'use client'

import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useLazyQuery, useMutation } from '@apollo/client';
import { GET_MESSAGES } from '../../../../graphql/query';
import { UPDATE_MESSAGE } from '../../../../graphql/mutation';
import { useAppStore } from '@/store';
import Image from 'next/image';
import { MdFolderZip } from 'react-icons/md';
import { IoMdArrowRoundDown } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'sonner';
import MessageList from './components/message-list';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { transports: ['websocket'] });

function MessageContainer() {
    const {
        selectedChatType,
        selectedChatData,
        userInfo,
        selectedChatMessages,
        setSelectedChatMessages,
        setFileDownloadProgress,
        setIsDownloading
    } = useAppStore();

    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingMessageText, setEditingMessageText] = useState('');
    const [showImage, setShowImage] = useState(false);
    const [imageURL, setImageUrl] = useState<string | null>(null);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 });

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [fetchMessages, { data: fetchedMessages }] = useLazyQuery(GET_MESSAGES);

    const downloadFile = async (fileUrl: string) => {
        try {
            setIsDownloading(true);
            setFileDownloadProgress(0);
            const fileName = fileUrl.split('/').pop();
            const downloadUrl = fileUrl;

            const response = await axios.get(downloadUrl, {
                responseType: 'blob',
                onDownloadProgress: ({ loaded, total }) => {
                    if (total) {
                        setFileDownloadProgress(Math.round((loaded * 100) / total));
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

    useEffect(() => {
        // Fetch messages when selectedChatData changes
        if (selectedChatData?.id && selectedChatType === 'contact') {
            fetchMessages({ variables: { input: { senderId: selectedChatData.id } } });
        }

        // Scroll to bottom when messages change or chat is switched
        if (scrollRef.current && isNearBottom()) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        // Cleanup: hide message options on outside click
        const handleClick = () => {
            if (showOptions) setShowOptions(false);
        };
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, [selectedChatData, selectedChatType, selectedChatMessages, showOptions]);

    useEffect(() => {
        // Set fetched messages to state
        if (fetchedMessages?.getMessage) {
            setSelectedChatMessages(fetchedMessages.getMessage);
        }
    }, [fetchedMessages, setSelectedChatMessages]);


    const isNearBottom = () => {
        const container = document.querySelector('.scrollbar-hidden');
        return container ? (container.scrollHeight - container.scrollTop - container.clientHeight < 100) : true;
    };


    const handleEditMessage = (id: string, content: string, createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diff = now.getTime() - created.getTime();
        const fiveMin = 5 * 60 * 1000;

        if (diff > fiveMin) {
            toast.warning('You can only edit messages within 5 minutes of sending.');
            return;
        }
        setEditingMessageId(id);
        setEditingMessageText(content);
    };

    const handleSaveEditedMessage = async (messageId: string) => {
        try {
            socket.emit('editMessage', {
                id: messageId,
                content: editingMessageText,
                edited: true
            });

            setEditingMessageId(null);
            setEditingMessageText('');
        } catch (error) {
            console.error("Failed to update message", error);
        }
    };
    const handleRemoveMessage = async (messageId: string) => {
        try {
            socket.emit('deleteMessage', {
                id: messageId,
            });
        } catch (error) {
            console.error("Failed to delete message", error);
        }
    };

    const handleReactToMessage = (messageId: string, type: string) => {
        socket.emit('reactToMessage', {
            messageId,
            userId: userInfo?.id,
            type
        });
    };

    return (
        <div className='flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full'>
            <MessageList
                messages={selectedChatMessages}
                userId={userInfo?.id}
                selectedChatType={selectedChatType}
                selectedMessageId={selectedMessageId}
                showOptions={showOptions}
                optionsPosition={optionsPosition}
                editingMessageId={editingMessageId}
                editingMessageText={editingMessageText}
                setEditingMessageId={setEditingMessageId}
                setEditingMessageText={setEditingMessageText}
                setSelectedMessageId={setSelectedMessageId}
                setShowOptions={setShowOptions}
                setOptionsPosition={setOptionsPosition}
                handleEditMessage={handleEditMessage}
                handleSaveEditedMessage={handleSaveEditedMessage}
                handleRemoveMessage={handleRemoveMessage}
                handleReactToMessage={handleReactToMessage}
                onCopy={(text) => {
                    if (text) navigator.clipboard.writeText(text);
                    toast.success("Copied to clipboard!");
                }}
                onDownloadFile={downloadFile}
                onShowImage={(url) => {
                    setShowImage(true);
                    setImageUrl(url);
                }}
            />
            <div ref={scrollRef} />
            {showImage && imageURL && (
                <div className='fixed z-[1000] top-0 left-0 md:h-[100vh] h-[100dvh] md:w-[100vw] w-[100dvw] flex items-center justify-center backdrop-blur-lg'>
                    <div>
                        <Image src={imageURL} alt="Image View" width={300} height={300} className='h-[80vh] w-full bg-cover rounded-xl' />
                    </div>
                    <div className='flex gap-5 fixed top-0 mt-5'>
                        <button className='bg-white/10 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => downloadFile(imageURL)}>
                            <IoMdArrowRoundDown />
                        </button>
                        <button className='bg-white/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => {
                            setShowImage(false);
                            setImageUrl(null);
                        }}>
                            <IoCloseSharp />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

}

export default MessageContainer;
