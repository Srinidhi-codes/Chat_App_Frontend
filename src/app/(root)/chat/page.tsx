'use client'
import PrivateRoutes from '@/app/components/PrivateRoutes'
import ChatPage from '@/app/Views/chat'
import React from 'react'

function Chat() {
    return (
        <div>
            <ChatPage />
        </div>
    )
}
// export default Chat
export default PrivateRoutes({ Component: Chat })