import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { getColor } from "@/lib/utils";

const ContactList = ({ contacts, isChannel = false }) => {
    const {
        selectedChatData,
        setSelectedChatData,
        setSelectedChatType,
        setSelectedChatMessages,
    } = useAppStore();

    const handleClick = (contact) => {
        const isAlreadySelected = selectedChatData?.id === contact?.id;

        // Update chat type first
        setSelectedChatType(isChannel ? "channel" : "contact");

        // If clicking a new chat, reset messages and set new data
        if (!isAlreadySelected) {
            setSelectedChatMessages([]);
            setSelectedChatData(contact);
        }
    };

    return (
        <div className="mt-5">
            {Array.isArray(contacts) && contacts?.map((contact) => {
                const isSelected = selectedChatData?.id === contact?.id;

                return (
                    <div
                        key={contact.id}
                        onClick={() => handleClick(contact)}
                        className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${isSelected
                            ? "bg-[#8417ff] hover:bg-[#8417ff]"
                            : "hover:bg-[#f1f1f111]"
                            }`}
                    >
                        <div className="flex gap-5 items-center justify-start text-neutral-300">
                            {!isChannel ? (
                                <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                                    {contact?.image ? (
                                        <AvatarImage
                                            src={contact?.image}
                                            alt="profile"
                                            className="object-cover w-full h-full bg-black"
                                        />
                                    ) : (
                                        <div
                                            className={`${selectedChatData && selectedChatData?.id == contact?.id ? "bg-[#ffffff22] border-2 border-white/50" : getColor()}uppercase h-10 w-10 text-lg border flex items-center justify-center rounded-full ${getColor(
                                                contact?.color
                                            )}`}
                                        >
                                            {contact?.firstName
                                                ? contact?.firstName.charAt(0)
                                                : contact?.email?.charAt(0)}
                                        </div>
                                    )}
                                </Avatar>
                            ) : (
                                <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                                    #
                                </div>
                            )}
                            <span className="text-sm font-medium text-white">
                                {isChannel
                                    ? contact.name
                                    : `${contact.firstName} ${contact.lastName}`}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ContactList;
