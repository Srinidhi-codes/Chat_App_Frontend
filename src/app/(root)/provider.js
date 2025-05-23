'use client'

// import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"
import { useEffect } from "react";
import { Toaster } from "sonner"
import { useAppStore } from '@/store';
import { SocketProvider } from '@/app/context/socketContext'
// import { createUploadLink } from "apollo-upload-client";
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink, ApolloProvider } from '@apollo/client';

const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_SOCKET_URL}/graphql`,
    credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
    operation.setContext({
        headers: {
            'x-apollo-operation-name': 'uploadFile',
        },
    });
    return forward(operation);
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
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
