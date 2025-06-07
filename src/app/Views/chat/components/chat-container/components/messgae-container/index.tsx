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
    const { theme } = useAppStore();

    return (
        <div
            className={`flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full ${theme === 'dark' ? 'text-white bg-none' : 'text-black bg-white'}`}
        >
            <MessageListWithItems />

        </div>
    );
}

export default MessageContainer;
