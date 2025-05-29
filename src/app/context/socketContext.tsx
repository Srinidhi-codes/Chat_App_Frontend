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
    const { userInfo, selectedChatMessages, setSelectedChatMessages, selectedChatData, selectedChatType, addMessage } = useAppStore();

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

                if (
                    selectedChatType !== undefined &&
                    (selectedChatData?.id === message?.sender?.id ||
                        selectedChatData?.id === message?.recipient?.id)
                ) {
                    addMessage(message);
                }
            };

            // SocketProvider: Change handleEditMessage to functional update
            const handleEditMessage = (updatedMessage: any) => {
                setSelectedChatMessages((prevMessages: any) => {
                    if (!Array.isArray(prevMessages)) {
                        console.warn("selectedChatMessages was not an array, skipping update.");
                        return prevMessages;
                    }
                    return prevMessages.map((msg) =>
                        msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                    );
                });
            };

            // SocketProvider: Change handleEditMessage to functional delete
            const handleDeleteMessage = (deletedMessage: any) => {
                setSelectedChatMessages((prevMessages: any) => {
                    if (!Array.isArray(prevMessages)) {
                        console.warn("selectedChatMessages was not an array, skipping delete.");
                        return prevMessages;
                    }
                    return prevMessages.filter((msg) => msg.id !== deletedMessage.id);
                });
            };

            // When a reaction is received from another user
            const updateMessageReaction = (reaction: any) => {
                setSelectedChatMessages((prevMessages: any) =>
                    prevMessages.map((msg: any) => {
                        if (msg.id === reaction.messageId) {
                            const existingReactions = msg.reactions || [];
                            // Check if the reaction already exists in message
                            const reactionExists = existingReactions.some((r: any) => r.id === reaction.id);

                            let updatedReactions;

                            if (reaction.toggledOff) {
                                // Reaction removed, filter it out
                                updatedReactions = existingReactions.filter((r: any) => r.id !== reaction.id);
                            } else {
                                // Reaction added or updated
                                // Remove any old reaction from same user with same type to avoid duplicates
                                updatedReactions = [
                                    ...existingReactions.filter((r: any) => !(r.userId === reaction.userId && r.type === reaction.type)),
                                    reaction,
                                ];
                            }

                            return { ...msg, reactions: updatedReactions };
                        }
                        return msg;
                    })
                );
            };




            socket.on('receiveMessage', handleReceiveMessage);
            socket.on('messageEdited', handleEditMessage);
            socket.on('messageDeleted', handleDeleteMessage);
            socket.on('messageReactionUpdated', updateMessageReaction);

            return () => {
                socket.off('receiveMessage', handleReceiveMessage);
                socket.off('messageEdited', handleEditMessage);
                socket.off('messageDeleted', handleDeleteMessage);
                socket.off('messageReactionUpdated', updateMessageReaction);
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
