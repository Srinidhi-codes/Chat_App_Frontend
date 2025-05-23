'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/index';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

const HOST = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

export const SocketProvider = ({ children }) => {
    const socket = useRef(null);
    const [socketInstance, setSocketInstance] = useState(null);
    const { userInfo } = useAppStore();

    useEffect(() => {
        if (userInfo) {
            socket.current = io(HOST, {
                withCredentials: true,
                query: { userId: userInfo.id }
            });

            socket.current.on("connect", () => {
                console.log("✅ Connected to socket server");
            })

            socket.current.on("disconnect", () => {
                console.log("⚠️ Disconnected from socket server");
            });

            const handleReceiveMessage = (message) => {
                const { selectedChatData, selectedChatType, addMessage } = useAppStore.getState();

                if (
                    selectedChatType !== undefined &&
                    (selectedChatData?.id === message?.sender?.id ||
                        selectedChatData?.id === message?.recipient?.id)
                ) {
                    addMessage(message);
                }
            };

            socket.current.on("receiveMessage", handleReceiveMessage);

            return () => {
                // socket.current.off("recieveMessage", handleRecieveMessage);
                socket.current.disconnect();
            };
        } else {
            if (socket.current) {
                socket.current.disconnect();
                socket.current = null;
                setSocketInstance(null);
            }
        }
    }, [userInfo]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
};
