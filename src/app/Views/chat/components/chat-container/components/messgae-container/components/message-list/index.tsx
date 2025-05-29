'use client';

import React from 'react';
import moment from 'moment';
import MessageItem from '../message-items';

interface MessageListProps {
    messages: any[];
    userId: string;
    selectedChatType: string;
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

const MessageList: React.FC<MessageListProps> = ({
    messages,
    userId,
    selectedChatType,
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
    if (!Array.isArray(messages) || messages.length === 0) {
        return <div className="text-center text-gray-400 mt-4">No messages yet.</div>;
    }

    let lastDate = '';

    return (
        <>
            {messages.map((message: any) => {
                const messageDate = moment(message.createdAt).format('YYYY-MM-DD');
                const showDate = messageDate !== lastDate;
                lastDate = messageDate;

                return (
                    <div key={message.id}>
                        {showDate && (
                            <div className="text-center text-gray-500 my-2">
                                {moment(message.createdAt).format('LL')}
                            </div>
                        )}

                        {selectedChatType === 'contact' && (
                            <MessageItem
                                message={message}
                                isSender={message.senderId === userId}
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
                                onCopy={onCopy}
                                onDownloadFile={onDownloadFile}
                                onShowImage={onShowImage}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
};

export default MessageList;
