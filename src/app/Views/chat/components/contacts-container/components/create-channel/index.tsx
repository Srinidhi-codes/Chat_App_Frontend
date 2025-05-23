'use client';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import dynamic from 'next/dynamic';
import { GET_ALL_CONTACTS, GET_SEARCH_TERM } from '../../graphql/query';
import { useLazyQuery, useMutation } from "@apollo/client";
import { useAppStore } from "@/store";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/MultipleSelector";
import { CREATE_CHANNEL } from "../../graphql/mutation";

const Lottie = dynamic(() => import('react-lottie'), { ssr: false });

const poppinsFont = Poppins({
    subsets: ["latin"],
    weight: "400"
});

function CreateChannel() {
    const [openNewChannelModal, setOpenNewChannelModal] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");
    const [fetchSearchTerm] = useLazyQuery(GET_SEARCH_TERM);
    const [fetchAllContacts] = useLazyQuery(GET_ALL_CONTACTS);
    const [createChannels] = useMutation(CREATE_CHANNEL);
    const [allContacts, setAllContacts] = useState([]);
    const { setSelectedChatType, setSelectedChatData, addChannels } = useAppStore();

    useEffect(() => {
        const getAll = async () => {
            try {
                const { data } = await fetchAllContacts();
                console.log(data, "TEST")
                setAllContacts(data?.getAllContacts || []);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };
        getAll();
    }, []);

    const createChannel = async () => {
        try {
            if (channelName.length > 0 && selectedContacts.length > 0) {
                const { data } = await createChannels({
                    variables: {
                        input: {
                            name: channelName,
                            members: selectedContacts.map((contact) => contact.value),
                        }
                    }
                });

                if (data?.createChannel) {
                    setChannelName("");
                    setSelectedContacts([]);
                    setOpenNewChannelModal(false);
                    addChannels(data.createChannel);
                }
            }
        } catch (error) {
            console.error("Error creating channel:", error);
        }
    };

    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <FaPlus
                            className='text-neutral-500 cursor-pointer text-start font-light hover:text-neutral-100 transition-all duration-300'
                            onClick={() => setOpenNewChannelModal(true)}
                        />
                    </TooltipTrigger>
                    <TooltipContent className='bg-[#1c1b1e] border-none text-white p-4 mb-2'>
                        Create New Channel
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={openNewChannelModal} onOpenChange={setOpenNewChannelModal}>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[500px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please fill up details for new channel</DialogTitle>
                        <DialogDescription />
                        <div>
                            <Input
                                placeholder="Channel Name"
                                className="rounded-lg p-6 bg-[#2c2e3b] border-none mt-2"
                                onChange={(e) => setChannelName(e.target.value)}
                                value={channelName}
                            />
                        </div>
                        <div>
                            <MultipleSelector className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                                defaultOptions={allContacts}
                                placeholder="Search Contacts"
                                value={selectedContacts}
                                onChange={setSelectedContacts}
                                emptyIndicator={
                                    <p className="text-center text-lg leading-10 text-gray-600">No results found.</p>
                                }
                            />
                        </div>
                        <div>
                            <Button className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
                                onClick={createChannel}
                            >Create Channel</Button>
                        </div>
                    </DialogHeader>

                    {/* <ScrollArea className="mt-4 overflow-y-auto flex-1 pr-2">
                        {contactsToRender.map((contact, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-4 p-2 hover:bg-[#2a2b33] cursor-pointer rounded-md"
                                onClick={() => selectNewContact(contact)}
                            >
                                <Avatar>
                                    <AvatarImage src={contact.image || ""} alt="User" />
                                </Avatar>
                                <span className={`${poppinsFont.className} text-sm`}>
                                    {contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.email}
                                </span>
                            </div>
                        ))}
                    </ScrollArea> */}
                </DialogContent>
            </Dialog>
        </>
    );
}

export default CreateChannel;
