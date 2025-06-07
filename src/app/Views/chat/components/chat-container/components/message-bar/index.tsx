'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { RiCloseFill, RiEmojiStickerLine } from 'react-icons/ri';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useAppStore } from '@/store';
import { useSocket } from '@/app/context/socketContext';
import { CREATE_MESSAGE, UPDATE_MESSAGE } from '../../../../graphql/mutation';
import { useMutation } from '@apollo/client';
import axios from 'axios';
import { toast } from 'sonner';
import io from 'socket.io-client';


function MessageBar() {
    const [message, setMessage] = useState('');
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const [editingMessageId1, setEditingMessageId1] = useState<string | null>(null);
    const {
        selectedChatType,
        selectedChatData,
        userInfo,
        setIsUploading,
        setFileUploadProgress,
        theme,
        editingMessageId,
        editingMessageContent,
        setEditingMessage,
    } = useAppStore();
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { transports: ['websocket'] });
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [createMessage] = useMutation(CREATE_MESSAGE);
    const [updateMessage] = useMutation(UPDATE_MESSAGE);
    const [isUploadingLocal, setIsUploadingLocal] = useState(false);

    useEffect(() => {
        if (editingMessageId) {
            setMessage(editingMessageContent);
            setEditingMessageId1(editingMessageId);
        }
    }, [editingMessageId, editingMessageContent]);


    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
                setEmojiPickerOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            if (editingMessageId1) {
                await updateMessage({
                    variables: {
                        input: {
                            id: editingMessageId1,
                            content: message,
                            edited: true,
                        },
                    },
                });

                socket?.emit('editMessage', {
                    id: editingMessageId1,
                    content: message,
                    edited: true,
                });

                toast.success('Message updated');
                setEditingMessageId1(null);
                setEditingMessage(null, '');
            } else {
                // Create new message
                if (selectedChatType === 'contact') {
                    socket?.emit('sendMessage', {
                        sender: userInfo?.id,
                        recipient: selectedChatData?.id,
                        content: message,
                        messageType: 'text',
                        fileUrl: undefined,
                    });
                } else if (selectedChatType === 'channel') {
                    socket?.emit('sendChannelMessage', {
                        sender: userInfo?.id,
                        content: message,
                        messageType: 'text',
                        fileUrl: undefined,
                        channelId: selectedChatData?.id
                    });
                }
                setMessage("");
            }
        } catch (err) {
            console.error('Failed to send/update message:', err);
            toast.error('Something went wrong');
        } finally {
            setMessage('');
        }
    };


    const handleAddEmoji = (emoji: EmojiClickData) => {
        setMessage((msg) => msg + emoji.emoji);
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    };

    const handleAssetUpload = async (file: File, type: 'image' | 'video') => {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', type === 'image' ? 'images_preset' : 'videos_preset');

        try {
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const api = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;
            const res = await axios.post(api, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent: any) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setFileUploadProgress(percent);
                },
            });

            return res.data.secure_url;
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload asset');
            return null;
        }
    };

    const handleAttachmentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isUploadingLocal) return;
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setIsUploadingLocal(true);
            setFileUploadProgress(0);

            let messageType: 'image' | 'video' | 'file';
            let uploadType: 'image' | 'video';

            if (file.type.startsWith('image')) {
                messageType = 'image';
                uploadType = 'image';
            } else if (file.type.startsWith('video')) {
                messageType = 'video';
                uploadType = 'video';
            } else {
                toast.warning('File upload not supported for this type');
                return;
            }

            const fileUrl = await handleAssetUpload(file, uploadType);
            if (!fileUrl) return;

            // await createMessage({
            //     variables: {
            //         input: {
            //             senderId: userInfo?.id,
            //             recipientId: selectedChatData.id,
            //             messageType,
            //             fileUrl,
            //             content: '',
            //         },
            //     },
            // });
            if (selectedChatType === 'contact') {
                socket?.emit('sendMessage', {
                    sender: userInfo?.id,
                    recipient: selectedChatData.id,
                    messageType,
                    fileUrl,
                    content: '',
                });
            } else if (selectedChatType === 'channel') {
                socket?.emit('sendChannelMessage', {
                    sender: userInfo?.id,
                    content: '',
                    messageType,
                    fileUrl,
                    channelId: selectedChatData.id
                });
            }

            toast.success(`${messageType} uploaded successfully`);
        } catch (err) {
            console.error('File upload failed:', err);
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
            setIsUploadingLocal(false);
            setFileUploadProgress(0);

            // Force reset file input
            if (fileInputRef.current) {
                fileInputRef.current.type = 'text';
                fileInputRef.current.type = 'file';
            }
        }
    };

    const handleEditMessage = (msgId: string, currentText: string) => {
        setEditingMessageId1(msgId);
        setMessage(currentText);
    };


    return (
        <div className={`sticky bottom-0 z-10 w-full h-auto min-h-[10vh] ${theme === 'dark' ? 'text-white bg-none' : 'text-black bg-white border-t'} flex justify-center items-center px-4 py-2 gap-4 md:gap-6`}>
            <div className={`w-full md:flex-1 flex ${theme === 'dark' ? 'text-white bg-[#2a2b33]' : 'text-black bg-white border'} rounded-md items-center gap-3 md:gap-5 pr-3 md:pr-5`}>
                <input
                    placeholder="Enter message here..."
                    type="text"
                    value={message}
                    className="flex-1 p-3 md:p-5 cursor-default bg-transparent rounded-md focus:outline-none text-base md:text-sm min-w-[180px]"
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                        }
                    }}
                />

                <Button
                    type="button"
                    onClick={handleAttachmentClick}
                    className={`${theme === 'dark' ? 'text-white bg-none' : 'text-black bg-white border'} text-neutral-500 cursor-pointer hover:text-white transition-colors duration-300 outline-none focus:outline-none`}
                >
                    <GrAttachment className="text-xl md:text-2xl" />
                </Button>
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAttachmentChange}
                />

                <div className="relative">
                    <Button
                        type="button"
                        onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                        className={`${theme === 'dark' ? 'text-white bg-none' : 'text-black bg-white border'} text-neutral-500 cursor-pointer hover:text-white transition-colors duration-300 outline-none focus:outline-none`}
                    >
                        <RiEmojiStickerLine className="text-xl md:text-2xl" />
                    </Button>
                    {emojiPickerOpen && (
                        <div
                            className="absolute bottom-16 right-0 z-50"
                            ref={emojiRef}
                        >
                            <EmojiPicker
                                theme={theme === 'dark' ? ('dark' as Theme) : ('light' as Theme)}
                                open={emojiPickerOpen}
                                onEmojiClick={handleAddEmoji}
                                autoFocusSearch={false}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className='flex gap-4 items-center'>
                {editingMessageId && <span onClick={() => { setEditingMessage(null, ''); setMessage('') }} className='bg-gray-200 p-2 rounded-full cursor-pointer' >
                    <RiCloseFill className='text-black font-bold text-lg hover:scale-120' />
                </span>}
                <Button
                    type="button"
                    onClick={handleSendMessage}
                    className="bg-[#8417ff] rounded-md cursor-pointer flex justify-center items-center p-3 md:p-5 hover:bg-[#741bda] focus:bg-[#741bda] outline-none transition-all duration-300"
                >
                    <IoSend className="text-xl md:text-2xl" />
                </Button>
            </div>
        </div >

    );
}

export default MessageBar;
