import ChatHeader from "./components/chat-header"
import MessageBar from "./components/message-bar"
import MessageConatiner from "./components/messgae-container"

const ChatContainer = () => {
    return (
        <div className="fixed top-0 inset-0 md:static md:flex-1 bg-[#1c1d25] flex flex-col h-[100dvh] overflow-hidden">
            <ChatHeader />
            <MessageConatiner />
            <MessageBar />
        </div>
    )
}

export default ChatContainer