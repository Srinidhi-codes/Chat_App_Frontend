'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import ContextEditMenu from '@/components/ContextEditMenu';
import { FaRegSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { useLazyQuery } from '@apollo/client';
import { GET_CHANNEL_MESSAGES, GET_MESSAGES } from '../../../../../../graphql/query';
import { useAppStore } from '@/store';
import Image from 'next/image';
import { MdFolderZip } from 'react-icons/md';
import { IoMdArrowRoundDown } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'sonner';
import moment from 'moment';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getColor } from '@/lib/utils';
import ImagePreview from '@/components/Image-Preview';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, { transports: ['websocket'] });

const checkIfImage = (filePath: string) =>
    /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i.test(filePath);

const MessageListWithItems = () => {
    const [activeEmojiPickerId, setActiveEmojiPickerId] = useState<string | null>(null);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState<'top' | 'bottom'>('top');
    const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const {
        selectedChatType,
        selectedChatData,
        userInfo,
        selectedChatMessages,
        setSelectedChatMessages,
        setFileDownloadProgress,
        setIsDownloading,
        theme,
        setEditingMessage
    } = useAppStore();

    const [showImage, setShowImage] = useState(false);
    const [imageURL, setImageUrl] = useState<string | null>(null);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [optionsPosition, setOptionsPosition] = useState({ x: 0, y: 0 });

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const prevFetchedIdRef = useRef<string | null>(null);


    const [fetchMessages, { data: fetchedMessages }] = useLazyQuery(GET_MESSAGES, {
        fetchPolicy: 'network-only',
    });
    const [fetchChannelMessages, { data: fetchedChannelMessages }] = useLazyQuery(GET_CHANNEL_MESSAGES, {
        fetchPolicy: 'network-only',
    });

    useEffect(() => {
        const id = selectedChatData?.id;

        if (!id || prevFetchedIdRef.current === id) return;

        prevFetchedIdRef.current = id;

        if (selectedChatType === 'contact') {
            fetchMessages({ variables: { input: { senderId: id } } });
        } else if (selectedChatType === 'channel') {
            fetchChannelMessages({ variables: { input: { channelId: id } } });
        }
    }, [selectedChatData?.id, selectedChatType]);


    useEffect(() => {
        const handleClick = () => {
            if (showOptions) setShowOptions(false);
        };
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [showOptions])


    useEffect(() => {
        if (fetchedMessages?.getMessage) {
            setSelectedChatMessages(fetchedMessages.getMessage);
        }
        if (fetchedChannelMessages?.getChannelMessages) {
            setSelectedChatMessages(fetchedChannelMessages.getChannelMessages);
        }
    }, [fetchedMessages, fetchedChannelMessages]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [selectedChatMessages, selectedChatData?.id]);

    const handleEditMessage = (id: string, content: string, createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diff = now.getTime() - created.getTime();
        const fiveMin = 5 * 60 * 1000;

        if (diff > fiveMin) {
            toast.warning('You can only edit messages within 5 minutes of sending.');
            return;
        }
        setEditingMessage(id, content);
    };

    const handleRemoveMessage = (messageId: string) => {
        socket.emit('deleteMessage', { id: messageId });
    };

    const handleReactToMessage = (messageId: string, type: string) => {
        socket.emit('reactToMessage', {
            messageId,
            userId: userInfo?.id,
            type
        });
    };

    const handleEmojiClick = (emojiData: any, messageId: string) => {
        handleReactToMessage(messageId, emojiData.emoji);
        setActiveEmojiPickerId(null);
    };

    const toggleEmojiPicker = (messageId: string) => {
        if (emojiButtonRef.current) {
            const rect = emojiButtonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            setEmojiPickerPosition(spaceBelow < 330 && spaceAbove > 330 ? 'top' : 'bottom');
            setActiveEmojiPickerId((prev) => (prev === messageId ? null : messageId));
        }
    };

    const downloadFile = async (fileUrl: string) => {
        try {
            setIsDownloading(true);
            setFileDownloadProgress(0);
            const fileName = fileUrl.split('/').pop();

            const response = await axios.get(fileUrl, {
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

    if (!Array.isArray(selectedChatMessages) || selectedChatMessages.length === 0) {
        return <div className="text-center text-gray-400 mt-4">No messages yet.</div>;
    }

    let lastDate = '';

    return (
        <>
            {selectedChatMessages.map((message: any) => {
                const messageDate = moment(message.createdAt).format('YYYY-MM-DD');
                const showDate = messageDate !== lastDate;
                lastDate = messageDate;
                const isSender = message?.senderId === userInfo?.id || message?.sender?.id === userInfo?.id;

                const messageClass = `${isSender
                    ? 'bg-[#82c5bca1] border border-gray-200 text-black/70 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                    : 'bg-gray-100 border border-gray-800 text-black rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'}`



                return (
                    <div ref={scrollRef} key={message.id} className={`my-1 ${isSender ? 'text-right' : 'text-left'}`}>
                        {showDate && (
                            <div className="text-center text-gray-500 my-2">
                                {moment(message.createdAt).format('LL')}
                            </div>
                        )}

                        <div
                            ref={menuRef}
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
                        >

                            {showOptions && selectedMessageId === message.id && (
                                <ContextEditMenu
                                    x={optionsPosition.x}
                                    y={optionsPosition.y}
                                    onEdit={() => {
                                        handleEditMessage(message.id, message.content, message.createdAt);
                                        setShowOptions(false);
                                    }}
                                    onRemove={() => {
                                        handleRemoveMessage(message.id);
                                        setShowOptions(false);
                                    }}
                                    isUserMessage={isSender}
                                    onCopy={() => {
                                        if (message.content) {
                                            navigator.clipboard.writeText(message.content);
                                            toast.success('Copied to clipboard!');
                                        }
                                        setShowOptions(false);
                                    }}
                                    onCancel={() => setShowOptions(false)}
                                />
                            )}

                            <div className={`relative inline-block px-4 py-2 min-w-[10%] max-w-[70%] break-words ${isSender
                                ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                                : 'rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                                } ${messageClass} noselect ${message.reactions?.length > 0 ? 'mb-10' : 'mb-2'}`}>


                                {message.content}

                                {(message.messageType === 'file' || message.messageType === 'image' || message.messageType === 'video') && (
                                    <div className={`inline-block p-4 break-words rounded-[1.025rem] ${messageClass}`}>
                                        {checkIfImage(message.fileUrl) ? (
                                            <div className="cursor-pointer" onClick={() => {
                                                setShowImage(true);
                                                setImageUrl(message.fileUrl);
                                            }}>
                                                <Image className='rounded-[1.025rem]' src={message.fileUrl} alt="Image" height={300} width={300} />
                                            </div>
                                        ) : (
                                            <div className="flex justify-center items-center gap-3">
                                                <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3"><MdFolderZip /></span>
                                                <span>{message?.fileUrl?.split("/").pop() ?? 'Unknown File'}</span>
                                                <span
                                                    className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer"
                                                    onClick={() => downloadFile(message.fileUrl)}
                                                >
                                                    <IoMdArrowRoundDown />
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-1">
                                    <div className="text-xs text-gray-800 text-right">
                                        {message.edited && <span className="italic mr-1">Edited</span>}
                                        {moment(message.edited ? message.updatedAt : message.createdAt).format('LT')}
                                    </div>
                                </div>

                                <div className="relative mt-1">
                                    <div className={`flex items-center gap-2 ${message.reactions?.length > 0 && 'justify-between'}`}>
                                        <button
                                            ref={emojiButtonRef}
                                            onClick={() => toggleEmojiPicker(message.id)}
                                            className="text-gray-800 hover:text-white"
                                            title="React"
                                        >
                                            <FaRegSmile />
                                        </button>
                                        {message.reactions?.length > 0 && (
                                            <div className="flex gap-1 mt-2 flex-wrap">
                                                {message.reactions.map((reaction: any, index: any) => (
                                                    <span key={index} className="text-xl px-2 py-0.5 bg-white/80 rounded-full">
                                                        {reaction.type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {activeEmojiPickerId === message.id && (
                                            <div className={`absolute z-[999] ${emojiPickerPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0`}>
                                                <EmojiPicker onEmojiClick={(e) => handleEmojiClick(e, message.id)} height={300} width={250} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ChannelMessageSenderIndicator message={message} />
                        <ImagePreview
                            showImage={showImage}
                            imageURL={imageURL}
                            setShowImage={setShowImage}
                            setImageUrl={setImageUrl}
                        />
                    </div>
                );
            })}

        </>
    );
};

export default MessageListWithItems;


const ChannelMessageSenderIndicator = ({ message }: any) => {
    const { selectedChatType, userInfo } = useAppStore();
    return (
        <>
            {selectedChatType === 'channel' && message.sender.id !== userInfo.id ?
                <div className='flex items-center justify-start gap-3'>
                    <Avatar className="h-7 w-7 rounded-full overflow-hidden">
                        {message?.image && (
                            <AvatarImage
                                src={message?.image}
                                alt="profile"
                                className="object-cover w-full h-full bg-black"
                            />)}
                        <div
                            className={`uppercase h-7 w-7 text-sm border flex items-center justify-center rounded-full ${getColor(message?.color)}`}>
                            {message?.firstName
                                ? message?.sender.firstName.charAt(0)
                                : message?.sender.email?.charAt(0)}
                        </div>
                    </Avatar>
                    <span className='text-sm'>{`${message.sender.firstName} ${message.sender.lastName}`}</span>
                </div>
                : <></>
            }
        </>
    )
}
