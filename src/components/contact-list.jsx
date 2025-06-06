import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { getColor } from "@/lib/utils";
import { useEffect, useState } from "react";
import ContextRemoveMenu from "./ContextRemoveMenu";
import { useSocket } from "@/app/context/socketContext";

const ContactList = ({ isChannel }) => {
    const {
        directMessagesContacts,
        setDirectMessagesContacts,
        channels,
        selectedChatData,
        setSelectedChatData,
        setSelectedChatType,
        setSelectedChatMessages,
        removeContact,
        removeChannel,
        selectedChatType,
        setIsChatOpen,
        theme
    } = useAppStore();
    const { onlineUsers } = useSocket();
    const unreadCountsContacts = useAppStore((state) => state.unreadCountsContacts);
    const unreadCountsChannels = useAppStore((state) => state.unreadCountsChannels);


    const [selectedContactId, setSelectedContactId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (
            selectedChatData &&
            !isChannel &&
            selectedChatData?.id &&
            selectedChatType === "contact"
        ) {
            setDirectMessagesContacts((prev) => {
                const alreadyExists = prev.some((c) => c.id === selectedChatData.id);
                if (alreadyExists) return prev;
                return [...prev, selectedChatData];
            });
        }
    }, [selectedChatData, selectedChatType]);

    const contacts = isChannel ? channels : directMessagesContacts;

    const handleClick = (contact) => {
        const isAlreadySelected = selectedChatData?.id === contact?.id;
        setSelectedChatType(isChannel ? "channel" : "contact");
        if (!isAlreadySelected) {
            setIsChatOpen(true)
            setSelectedChatMessages([]);
            setSelectedChatData(contact);
        }
        setSelectedContactId(null);
    };

    const handleRemoveContact = (id) => {
        isChannel ? removeChannel(id) : removeContact(id);
        setSelectedContactId(null);
        setSelectedChatType("");
        setSelectedChatData(null);
    };

    const handleContextOrLongPress = (e, id) => {
        e.preventDefault();
        const x = e.clientX || (e.touches && e.touches[0]?.clientX);
        const y = e.clientY || (e.touches && e.touches[0]?.clientY);
        if (x != null && y != null) {
            setMenuPosition({ x, y });
            setSelectedContactId(id);
        }
    };

    return (
        <div className="mt-5 relative">
            {Array.isArray(contacts) &&
                contacts.map((contact, index) => {
                    const isSelected = selectedChatData?.id === contact?.id;
                    const showOptions = selectedContactId === contact?.id;
                    const isOnline = !isChannel && onlineUsers.includes(contact.id);
                    const unreadCount = isChannel
                        ? unreadCountsChannels[contact.id] || 0
                        : unreadCountsContacts[contact.id] || 0;

                    return (
                        <div
                            key={contact.id || index}
                            onClick={() => handleClick(contact)}
                            onContextMenu={(e) => handleContextOrLongPress(e, contact.id)}
                            onTouchStart={(e) => {
                                const timer = setTimeout(() => handleContextOrLongPress(e, contact.id), 600);
                                e.currentTarget.addEventListener("touchend", () => clearTimeout(timer), { once: true });
                                e.currentTarget.addEventListener("touchmove", () => clearTimeout(timer), { once: true });
                            }}
                            className={`p-2 transition-all duration-300 cursor-pointer noselect rounded-3xl ${isSelected
                                ? theme !== 'dark'
                                    ? "bg-[#d9b8ff]"
                                    : "bg-[#8417ff]"
                                : "hover:bg-[#f1f1f111]"} `}>
                            <div className="flex gap-3 items-center justify-start text-neutral-300 relative">
                                {!isChannel ? (
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 rounded-full overflow-hidden hover:scale-110 duration-300 transition-all">
                                            {contact?.image ? (
                                                <AvatarImage
                                                    src={contact.image}
                                                    alt="profile"
                                                    className="object-cover w-full h-full bg-black"
                                                />
                                            ) : (
                                                <div
                                                    className={`uppercase h-10 w-10 text-lg border flex items-center justify-center rounded-full ${theme === 'dark' ? 'text-white' : 'text-black'} ${isSelected
                                                        ? "bg-[#ffffff22] border-2 border-white/50"
                                                        : getColor(contact?.color)}`}
                                                >
                                                    {contact?.firstName?.charAt(0) ||
                                                        contact?.email?.charAt(0)}
                                                </div>
                                            )}

                                        </Avatar>
                                        {isOnline ? (
                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border border-white rounded-full" />
                                        ) : (<span className="absolute bottom-0 right-1  h-2.5 w-2.5 bg-gray-500 border border-white rounded-full" />)}
                                    </div>
                                ) : (
                                    <div className={`${theme === 'dark' ? 'text-white bg-[#ffffff22]' : 'text-white bg-gray-700'}  h-10 w-13 flex items-center justify-center overflow-hidden rounded-full`}>
                                        #
                                    </div>
                                )}

                                <div className="flex justify-between items-center w-full pr-4">
                                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                                        {isChannel
                                            ? contact.name
                                            : `${contact.firstName} ${contact.lastName}`}
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {showOptions && (
                                <ContextRemoveMenu
                                    x={menuPosition.x}
                                    y={menuPosition.y}
                                    onDelete={() => handleRemoveContact(contact.id)}
                                    onCancel={() => setSelectedContactId(null)}
                                />
                            )}
                        </div>
                    );
                })}
        </div >
    );
};

export default ContactList;
