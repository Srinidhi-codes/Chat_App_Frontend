'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAppStore } from '../../store/index';
import { io, Socket } from 'socket.io-client';

const HOST = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';

interface SocketContextValue {
    socket: Socket | null;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextValue>({
    socket: null,
    onlineUsers: [],
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const socketRef = useRef<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const userInfo = useAppStore((state) => state.userInfo);

    useEffect(() => {
        if (userInfo) {
            socketRef.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id },
            });

            const socket = socketRef.current;

            socket.on('connect', () => {
                console.log('✅ Connected to socket server');
            });

            socket.on('disconnect', () => {
                console.log('⚠️ Disconnected from socket server');
            });

            // Initial online users
            socket.on('onlineUsers', (users: string[]) => {
                setOnlineUsers(users);
            });

            // When a new user comes online
            socket.on('userOnline', (userId: string) => {
                setOnlineUsers((prev) =>
                    prev.includes(userId) ? prev : [...prev, userId]
                );
            });

            // When a user goes offline
            socket.on('userOffline', (userId: string) => {
                setOnlineUsers((prev) => prev.filter((id) => id !== userId));
            });

            // Message handlers
            const handleReceiveMessage = (message: any) => {
                const { selectedChatData, selectedChatType, addMessage } = useAppStore.getState();

                if (
                    selectedChatType !== undefined &&
                    (selectedChatData?.id === message?.sender?.id ||
                        selectedChatData?.id === message?.recipient?.id)
                ) {
                    addMessage(message);
                }
            };

            const handleEditMessage = (updatedMessage: any) => {
                const { selectedChatMessages, setSelectedChatMessages } = useAppStore.getState();

                if (Array.isArray(selectedChatMessages)) {
                    const updatedMessages = selectedChatMessages.map((msg) =>
                        msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                    );
                    setSelectedChatMessages(updatedMessages);
                } else {
                    console.warn("selectedChatMessages was not an array, skipping update.");
                }
            };

            socket.on('receiveMessage', handleReceiveMessage);
            socket.on('messageEdited', handleEditMessage);

            return () => {
                socket.off('receiveMessage', handleReceiveMessage);
                socket.off('messageEdited', handleEditMessage);
                socket.off('onlineUsers');
                socket.off('userOnline');
                socket.off('userOffline');
                socket.disconnect();
            };
        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setOnlineUsers([]);
            }
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
