'use client'

import { useEffect } from "react";
import { Toaster } from "sonner"
import { useAppStore } from '@/store';
import { SocketProvider } from '@/app/context/socketContext'
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider } from '@apollo/client';

const httpLink = createHttpLink({
    uri: '/api/graphql',
    credentials: 'include',
});

const client = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});

export default function Provider({ children }) {
    const setUserInfo = useAppStore((state) => state.setUserInfo);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
    }, [setUserInfo]);

    return (
        <ApolloProvider client={client}>
            <SocketProvider>
                <Toaster />
                {children}
            </SocketProvider>
        </ApolloProvider>
    );
}
