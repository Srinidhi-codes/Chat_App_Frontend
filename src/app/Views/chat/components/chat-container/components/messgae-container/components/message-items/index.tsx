'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import moment from 'moment';
import { MdFolderZip } from 'react-icons/md';
import { IoMdArrowRoundDown } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import ContextEditMenu from '@/components/ContextEditMenu';
import { FaRegSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

interface MessageItemProps {
    message: any;
    isSender: boolean;
    selectedMessageId: string | null;
    showOptions: boolean;
    optionsPosition: { x: number; y: number };
    editingMessageId: string | null;
    editingMessageText: string;
    setEditingMessageId: (id: string | null) => void;
    setEditingMessageText: (text: string) => void;
    setSelectedMessageId: (id: string | null) => void;
    setShowOptions: (show: boolean) => void;
    setOptionsPosition: (pos: { x: number; y: number }) => void;
    handleEditMessage: (id: string, content: string, createdAt: string) => void;
    handleSaveEditedMessage: (id: string) => void;
    handleRemoveMessage: (id: string) => void;
    handleReactToMessage: (id: string, emoji: string) => void;
    onCopy: (text: string) => void;
    onDownloadFile: (fileUrl: string) => void;
    onShowImage: (url: string) => void;
}

const checkIfImage = (filePath: string) =>
    /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i.test(filePath);

const MessageItem: React.FC<MessageItemProps> = ({
    message,
    isSender,
    selectedMessageId,
    showOptions,
    optionsPosition,
    editingMessageId,
    editingMessageText,
    setEditingMessageId,
    setEditingMessageText,
    setSelectedMessageId,
    setShowOptions,
    setOptionsPosition,
    handleEditMessage,
    handleSaveEditedMessage,
    handleRemoveMessage,
    handleReactToMessage,
    onCopy,
    onDownloadFile,
    onShowImage
}) => {
    const messageClass = isSender
        ? 'bg-[#8417ff]/5 text-[#8417ff] border-[#8417ff]/50 text-left'
        : 'bg-[#2a2b33]/5 text-white/80 border-white/50';

    const [showPicker, setShowPicker] = useState(false);
    const [activeEmojiPickerId, setActiveEmojiPickerId] = useState<string | null>(null);

    const handleEmojiClick = (emojiData: any) => {
        const emoji = emojiData.emoji;
        handleReactToMessage(message.id, emoji);
        setActiveEmojiPickerId(null);
    };

    return (
        <div
            onContextMenu={(e) => {
                e.preventDefault();
                setSelectedMessageId(message.id);
                setShowOptions(true);
                setOptionsPosition({ x: e.clientX, y: e.clientY });
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
                    onRemove={() => {
                        handleRemoveMessage(message.id);
                        setShowOptions(false);
                    }}
                    isUserMessage={isSender}
                    onCopy={() => {
                        onCopy(message.content);
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
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEditedMessage(message.id);
                            }
                        }}
                        className="w-full px-3 py-2 rounded-xs text-sm bg-gray-800 text-white border border-gray-600"
                    />
                    <div className="flex gap-3 mt-1">
                        <Button onClick={() => handleSaveEditedMessage(message.id)}>Save</Button>
                        <Button onClick={() => setEditingMessageId(null)}>Cancel</Button>
                    </div>
                </div>
            ) : (
                <>
                    <div className={`relative border inline-block px-2 py-1 min-w-[10%] max-w-[50%] break-words rounded-xs ${messageClass} noselect`}>
                        {message.content}
                        <div className="flex justify-between items-center mt-1">
                            <div className="flex gap-1 items-center">
                                <button
                                    onClick={() => setActiveEmojiPickerId((prev) => (prev === message.id ? null : message.id))}
                                    className="text-gray-500 hover:text-white"
                                    title="React"
                                >
                                    <FaRegSmile />
                                </button>

                                {activeEmojiPickerId === message.id && (
                                    <div className="absolute bottom-full mb-2 left-0 z-[999]">
                                        <EmojiPicker onEmojiClick={handleEmojiClick} height={300} width={250} />
                                    </div>
                                )}
                                {message.reactions?.length > 0 && (
                                    <div className="absolute left-[70%] top-[105%]">
                                        {message.reactions.map((reaction: any, index: any) => (
                                            <span key={index} className="text-xl px-2 py-0.5 bg-white/80 rounded-full">
                                                {reaction.type}
                                            </span>
                                        ))}
                                    </div>
                                )}

                            </div>
                            <div className="text-xs text-gray-600 text-right">
                                {message.edited && <span className="italic mr-1">Edited</span>}
                                {moment(message.edited ? message.updatedAt : message.createdAt).format('LT')}
                            </div>
                        </div>
                    </div>

                    {(message.messageType === 'file' || message.messageType === 'image' || message.messageType === 'video') && (
                        <div className={`border inline-block p-4 max-w-[50%] break-words rounded-xs ${messageClass}`}>
                            {checkIfImage(message.fileUrl) ? (
                                <div className="cursor-pointer" onClick={() => onShowImage(message.fileUrl)}>
                                    <Image src={message.fileUrl} alt="Image" height={300} width={300} />
                                </div>
                            ) : (
                                <div className="flex justify-center items-center gap-3">
                                    <span className="text-white/80 text-3xl bg-black/20 rounded-full p-3"><MdFolderZip /></span>
                                    <span>{message?.fileUrl?.split("/").pop() ?? 'Unknown File'}</span>
                                    <span
                                        className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer"
                                        onClick={() => onDownloadFile(message.fileUrl)}
                                    >
                                        <IoMdArrowRoundDown />
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div >
    );
};

export default MessageItem;
