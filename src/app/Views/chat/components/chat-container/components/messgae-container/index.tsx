'use client';

import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useLazyQuery } from '@apollo/client';
import { GET_CHANNEL_MESSAGES, GET_MESSAGES } from '../../../../graphql/query';
import { useAppStore } from '@/store';
import Image from 'next/image';
import { MdFolderZip } from 'react-icons/md';
import { IoMdArrowRoundDown } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'sonner';
import MessageListWithItems from './components/message-list';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, { transports: ['websocket'] });

function MessageContainer() {

    return (
        <div
            className='flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full'
        >
            <MessageListWithItems
            // messages={selectedChatMessages}
            // userId={userInfo?.id}
            // selectedChatType={selectedChatType}
            // selectedMessageId={selectedMessageId}
            // showOptions={showOptions}
            // optionsPosition={optionsPosition}
            // editingMessageId={editingMessageId}
            // editingMessageText={editingMessageText}
            // setEditingMessageId={setEditingMessageId}
            // setEditingMessageText={setEditingMessageText}
            // setSelectedMessageId={setSelectedMessageId}
            // setShowOptions={setShowOptions}
            // setOptionsPosition={setOptionsPosition}
            // handleEditMessage={handleEditMessage}
            // handleSaveEditedMessage={handleSaveEditedMessage}
            // handleRemoveMessage={handleRemoveMessage}
            // handleReactToMessage={handleReactToMessage}
            // onCopy={(text) => {
            //     if (text) navigator.clipboard.writeText(text);
            //     toast.success('Copied to clipboard!');
            // }}
            // onDownloadFile={downloadFile}
            // onShowImage={(url) => {
            //     setShowImage(true);
            //     setImageUrl(url);
            // }}
            />
            
        </div>
    );
}

export default MessageContainer;
