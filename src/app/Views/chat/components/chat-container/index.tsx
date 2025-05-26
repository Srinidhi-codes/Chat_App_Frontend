import ChatHeader from "./components/chat-header"
import MessageBar from "./components/message-bar"
import MessageConatiner from "./components/messgae-container"

const ChatContainer = () => {
    return (
        <div className="fixed top-0 md:h-[100vh] h-[100dvh] md:w-[100vw] w-[100dvw]  bg-[#1c1d25] flex flex-col md:static md:flex-1">
            <ChatHeader />
            <MessageConatiner />
            <MessageBar />
        </div>
    )
}

export default ChatContainer