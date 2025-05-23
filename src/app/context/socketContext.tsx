'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useAppStore } from '../../store/index';
import { io, Socket } from 'socket.io-client';

const HOST = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';

// Define the SocketContext with proper type
const SocketContext = createContext < Socket | null > (null);

// Custom hook to access the socket context
export const useSocket = () => useContext(SocketContext);

// Define props for the provider
interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const socketRef = useRef < Socket | null > (null);
    const [socketInstance, setSocketInstance] = useState < Socket | null > (null);
    const { userInfo } = useAppStore();

    useEffect(() => {
        if (userInfo) {
            socketRef.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id },
            });

            const socket = socketRef.current;
            setSocketInstance(socket);

            socket.on('connect', () => {
                console.log('✅ Connected to socket server');
            });

            socket.on('disconnect', () => {
                console.log('⚠️ Disconnected from socket server');
            });

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

            socket.on('receiveMessage', handleReceiveMessage);

            return () => {
                socket.off('receiveMessage', handleReceiveMessage);
                socket.disconnect();
            };
        } else {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocketInstance(null);
            }
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};
