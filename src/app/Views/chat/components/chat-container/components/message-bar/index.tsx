'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GrAttachment } from 'react-icons/gr';
import { IoSend } from 'react-icons/io5';
import { RiEmojiStickerLine } from 'react-icons/ri';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useAppStore } from '@/store';
import { useSocket } from '@/app/context/socketContext';
import { CREATE_MESSAGE } from '../../../../graphql/mutation';
import { useMutation } from '@apollo/client';
import axios from 'axios';
import { toast } from 'sonner';

function MessageBar() {
    const [message, setMessage] = useState('');
    const emojiRef = useRef<HTMLDivElement | null>(null);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const {
        selectedChatType,
        selectedChatData,
        userInfo,
        setIsUploading,
        setFileUploadProgress,
    } = useAppStore();
    const socket = useSocket();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [createMessage] = useMutation(CREATE_MESSAGE);
    const [isUploadingLocal, setIsUploadingLocal] = useState(false); // Local lock

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

        if (selectedChatType === 'contact') {
            socket?.emit('sendMessage', {
                sender: userInfo?.id,
                content: message,
                recipient: selectedChatData.id,
                messageType: 'text',
                fileUrl: undefined,
            });
        }

        setMessage('');
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

            console.log('Uploading and sending:', {
                fileUrl,
                sender: userInfo?.id,
                recipient: selectedChatData.id,
                messageType,
            });

            await createMessage({
                variables: {
                    input: {
                        senderId: userInfo?.id,
                        recipientId: selectedChatData.id,
                        messageType,
                        fileUrl,
                        content: '',
                    },
                },
            });

            socket?.emit('sendMessage', {
                sender: userInfo?.id,
                recipient: selectedChatData.id,
                messageType,
                fileUrl,
                content: '',
            });

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

    return (
        <div className="h-auto min-h-[10vh] bg-[#1c1d25] flex justify-center items-center px-4 py-2 gap-4 md:gap-6">
            <div className="w-full md:flex-1 flex bg-[#2a2b33] rounded-md items-center gap-3 md:gap-5 pr-3 md:pr-5">
                <input
                    placeholder="Enter message here..."
                    type="text"
                    value={message}
                    className="flex-1 p-3 md:p-5 cursor-default bg-transparent rounded-md focus:outline-none text-sm md:text-base min-w-[180px]"
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
                    className="text-neutral-500 cursor-pointer hover:text-white transition-colors duration-300 outline-none focus:outline-none"
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
                        className="text-neutral-500 cursor-pointer hover:text-white transition-colors duration-300 outline-none focus:outline-none"
                    >
                        <RiEmojiStickerLine className="text-xl md:text-2xl" />
                    </Button>
                    {emojiPickerOpen && (
                        <div
                            className="absolute bottom-16 right-0 z-50"
                            ref={emojiRef}
                        >
                            <EmojiPicker
                                theme={'dark' as Theme}
                                open={emojiPickerOpen}
                                onEmojiClick={handleAddEmoji}
                                autoFocusSearch={false}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Button
                type="button"
                onClick={handleSendMessage}
                className="bg-[#8417ff] rounded-md flex justify-center items-center p-3 md:p-5 hover:bg-[#741bda] focus:bg-[#741bda] outline-none transition-all duration-300"
            >
                <IoSend className="text-xl md:text-2xl" />
            </Button>
        </div>

    );
}

export default MessageBar;
