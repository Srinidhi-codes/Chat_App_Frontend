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
import ContextEditMenu from '@/components/ContextEditMenu';

const socket = io('http://localhost:8080', { transports: ['websocket'] });

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
    const [updateMessage] = useMutation(UPDATE_MESSAGE);

    const checkIfImage = (filePath: string) =>
        /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i.test(filePath);

    const downloadFile = async (fileUrl: string) => {
        try {
            setIsDownloading(true);
            setFileDownloadProgress(0);
            const fileName = fileUrl.split('/').pop();
            const downloadUrl = `http://localhost:8080/api/download/${fileName}`;

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

    const getMessages = () => {
        if (selectedChatData?.id) {
            fetchMessages({
                variables: { input: { senderId: selectedChatData.id } },
            });
        }
    };

    useEffect(() => {
        if (fetchedMessages?.getMessage) {
            setSelectedChatMessages(fetchedMessages.getMessage);
        }
    }, [fetchedMessages, setSelectedChatMessages]);

    useEffect(() => {
        const handleClick = () => {
            if (showOptions) setShowOptions(false);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [showOptions]);

    useEffect(() => {
        if (selectedChatData?.id && selectedChatType === 'contact') getMessages();
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChatData, selectedChatType, selectedChatMessages]);

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
            await updateMessage({
                variables: {
                    input: {
                        id: messageId,
                        content: editingMessageText,
                        edited: true,
                    }
                }
            });

            socket.emit('editMessage', {
                id: messageId,
                content: editingMessageText,
            });

            setEditingMessageId(null);
            setEditingMessageText('');
        } catch (error) {
            console.error("Failed to update message", error);
        }
    };

    const renderDMMessages = (message: any) => {
        const isSender = message?.senderId === userInfo?.id;
        const messageClass = isSender
            ? 'bg-[#8417ff]/5 text-[#8417ff] border-[#8417ff]/50'
            : 'bg-[#2a2b33]/5 text-white/80 border-white/50';

        return (
            <div
                key={message.id}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setSelectedMessageId(message.id);
                    setShowOptions(true);
                    setOptionsPosition({ x: e.clientX, y: e.clientY });
                }}
                onTouchStart={(e) => {
                    const touchTimer = setTimeout(() => {
                        setSelectedMessageId(message.id);
                        setShowOptions(true);
                        const touch = e.touches[0];
                        setOptionsPosition({ x: touch.clientX, y: touch.clientY });
                    }, 600);

                    const clearTimer = () => clearTimeout(touchTimer);
                    e.currentTarget.addEventListener('touchend', clearTimer, { once: true });
                    e.currentTarget.addEventListener('touchmove', clearTimer, { once: true });
                }}
                className={`my-1 ${isSender ? 'text-right' : 'text-left'}`}
            >
                {showOptions && selectedMessageId === message.id && (
                    <ContextEditMenu
                        x={optionsPosition.x}
                        y={optionsPosition.y}
                        onEdit={() => {
                            handleEditMessage(message.id, message.content, message.createdAt);
                            setShowOptions(false);
                        }}
                        isUserMessage={isSender}
                        onCopy={() => {
                            if (message?.content) navigator.clipboard.writeText(message.content);
                            toast.success("Copied to clipboard!");
                            setShowOptions(false);
                        }}
                        onCancel={() => setShowOptions(false)}
                    />
                )}

                {editingMessageId === message.id ? (
                    <div className="inline-block max-w-[50%]">
                        <input
                            type="text"
                            value={editingMessageText}
                            onChange={(e) => setEditingMessageText(e.target.value)}
                            className="w-full px-3 py-2 rounded-xs text-sm bg-gray-800 text-white border border-gray-600"
                        />
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => handleSaveEditedMessage(message.id)}
                                className="text-blue-400 text-xs underline"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingMessageId(null)}
                                className="text-gray-400 text-xs underline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {message.messageType === 'text' && (
                            <div className={`border inline-block p-4 max-w-[50%] break-words rounded-xs ${messageClass}`}>
                                {message.content}
                            </div>
                        )}

                        {(message.messageType === 'file' || message.messageType === 'image' || message.messageType === 'video') && (
                            <div className={`border inline-block p-4 max-w-[50%] break-words rounded-xs ${messageClass}`}>
                                {checkIfImage(message.fileUrl) ? (
                                    <div className='cursor-pointer' onClick={() => {
                                        setShowImage(true);
                                        setImageUrl(message?.fileUrl);
                                    }}>
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

                        {message.edited && (
                            <div className="text-xs text-gray-400 italic mt-1">Edited</div>
                        )}
                        <div className='text-xs text-gray-600'>
                            {moment(message.createdAt).format('LT')}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderMessages = () => {
        let lastDate = '';
        if (!Array.isArray(selectedChatMessages) || selectedChatMessages.length === 0) {
            return <div className="text-center text-gray-400 mt-4">No messages yet.</div>;
        }

        return selectedChatMessages.map((message: any) => {
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
            <div ref={scrollRef} />
            {showImage && imageURL && (
                <div className='fixed z-[1000] top-0 left-0 h-[100vh] w-[100vw] flex items-center justify-center backdrop-blur-lg'>
                    <div>
                        <Image src={imageURL} alt="Image View" width={300} height={300} className='h-[80vh] w-full bg-cover rounded-xl' />
                    </div>
                    <div className='flex gap-5 fixed top-0 mt-5'>
                        <button className='bg-white/10 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => downloadFile(imageURL)}>
                            <IoMdArrowRoundDown />
                        </button>
                        <button className='bg-white/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer transition-all duration-300' onClick={() => { setShowImage(false); setImageUrl(null); }}>
                            <IoCloseSharp />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MessageContainer;
