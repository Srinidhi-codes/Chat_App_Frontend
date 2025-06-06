import { useSocket } from "@/app/context/socketContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store"
import { useRouter } from "next/navigation";
import { RiCloseFill } from "react-icons/ri"

function ChatHeader() {
    const { closeChat, selectedChatData, selectedChatType, setIsOtherProfile, setOtherProfileData, theme } = useAppStore();
    const { onlineUsers } = useSocket();
    const router = useRouter();
    const isOnline = selectedChatType === 'contact' &&
        selectedChatData?.id != null &&
        onlineUsers.includes(String(selectedChatData.id));

    return (
        <div className={`h-[10vh] border-b-2 border-[#2f303b] flex justify-between md:px-10 px-2 items-center ${theme === 'dark' ? 'text-white bg-none' : 'text-black bg-white'}`}>
            <div className="flex gap-5 items-center w-full justify-between">
                <div className="flex gap-3 min-w-fit items-center justify-center cursor-pointer" onClick={() => {
                    setIsOtherProfile(true);
                    setOtherProfileData(selectedChatData);
                    router.push("/profile");
                }}>
                    <div className="w-12 h-12 relative">
                        {selectedChatType == 'channel' ?
                            <div className="flex items-center gap-6 w-[10rem]">
                                <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center overflow-hidden rounded-full">
                                    #
                                </div>
                                <p className="text-sm">{selectedChatData?.name}</p>
                            </div>
                            :
                            <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                {selectedChatData?.image ? (
                                    <AvatarImage
                                        src={selectedChatData?.image}
                                        alt="profile"
                                        className="object-cover w-full h-full bg-black"
                                    />
                                ) : (
                                    <div
                                        className={`uppercase h-12 w-12 text-lg border flex items-center justify-center rounded-full ${getColor(selectedChatData?.color)}`}
                                    >
                                        {selectedChatData?.firstName
                                            ? selectedChatData?.firstName.charAt(0)
                                            : selectedChatData?.email?.charAt(0)}
                                    </div>
                                )}
                            </Avatar>}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">
                            {selectedChatType === 'contact' && selectedChatData?.firstName && selectedChatData?.lastName
                                ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
                                : selectedChatData?.email}
                        </span>
                        {isOnline ?
                            <div className="flex items-center gap-1">
                                <span className="h-2.5 w-2.5 bg-green-500 border border-white rounded-full"></span>
                                <span className="text-xs font-medium text-green-500">Online</span>
                            </div>
                            :
                            <div className="flex items-center gap-2">
                                <span className=" h-2.5 w-2.5 bg-gray-500 border border-white rounded-full"></span>
                                <span className="text-xs font-medium text-gray-500">Offline</span>
                            </div>
                        }
                    </div>
                </div>
                <div className="flex items-center justify-center gap-5">
                    <button className="text-neutral-500 focus:border-none focus:outline-none hover:text-red-500 hover:rotate-90 duration-300 transition-all">
                        <RiCloseFill onClick={closeChat} className="text-3xl" />
                    </button>
                </div>
            </div>
        </div >
    )
}

export default ChatHeader