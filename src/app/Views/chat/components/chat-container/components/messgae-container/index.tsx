'use client';
import { useAppStore } from '@/store';
import MessageListWithItems from './components/message-list';

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
