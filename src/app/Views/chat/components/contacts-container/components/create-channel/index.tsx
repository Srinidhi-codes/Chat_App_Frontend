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
import { FaPlus, FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import dynamic from 'next/dynamic';
import { GET_ALL_CONTACTS, GET_SEARCH_CHANNELS, GET_SEARCH_TERM } from '../../graphql/query';
import { useLazyQuery, useMutation } from "@apollo/client";
import { useAppStore } from "@/store";
import { Poppins } from "next/font/google";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/MultipleSelector";
import { CREATE_CHANNEL } from "../../graphql/mutation";
import { ScrollArea } from "@/components/ui/scroll-area";

const Lottie = dynamic(() => import('react-lottie'), { ssr: false });

const poppinsFont = Poppins({
    subsets: ["latin"],
    weight: "400"
});

type Contact = {
    value: string;
    label: string;
};

function CreateChannel() {
    const [openChannelSearchModal, setOpenChannelSearchModal] = useState(false);
    const [openNewChannelModal, setOpenNewChannelModal] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
    const [channelName, setChannelName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchedChannels, setSearchedChannels] = useState([]);
    const [fetchSearchChannel] = useLazyQuery(GET_SEARCH_CHANNELS);
    const [fetchAllContacts] = useLazyQuery(GET_ALL_CONTACTS);
    const [createChannels] = useMutation(CREATE_CHANNEL);
    const [allContacts, setAllContacts] = useState([]);
    const { setSelectedChatType, setSelectedChatData, addChannels, setChannels } = useAppStore();

    useEffect(() => {
        const getAll = async () => {
            try {
                const { data } = await fetchAllContacts();
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
                            members: selectedContacts.map((contact) => contact?.value),
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

    const searchChannels = async (searchTerm: string) => {
        setSearchTerm(searchTerm);
        if (searchTerm.trim()) {
            try {
                const { data } = await fetchSearchChannel({ variables: { searchTerm } });
                setSearchedChannels(data?.searchChannel || []);
            } catch (err) {
                console.error("Error searching channels:", err);
                setSearchedChannels([]);
            }
        } else {
            setSearchedChannels([]);
        }
    };


    return (
        <>
            <div className="flex items-center gap-3">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex gap-3">
                                <FaSearch
                                    className='text-neutral-500 cursor-pointer text-start font-light hover:text-neutral-100 transition-all duration-300'
                                    onClick={() => setOpenChannelSearchModal(true)}
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white p-4 mb-2'>
                            Search Channel
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div className="flex gap-3">
                                <FaPlus
                                    className='text-neutral-500 cursor-pointer text-start font-light hover:text-neutral-100 transition-all duration-300'
                                    onClick={() => setOpenNewChannelModal(true)}
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className='bg-[#1c1b1e] border-none text-white p-4 mb-2'>
                            Create New Channel
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

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
                </DialogContent>
            </Dialog>

            <Dialog open={openChannelSearchModal} onOpenChange={setOpenChannelSearchModal}>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[500px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Search Channels</DialogTitle>
                        <DialogDescription />
                        <Input
                            placeholder="Search channels"
                            className="rounded-lg p-6 bg-[#2c2e3b] border-none mt-2"
                            value={searchTerm}
                            onChange={(e) => searchChannels(e.target.value)}
                        />

                        <ScrollArea className="mt-4 max-h-[300px]">
                            {searchedChannels.length > 0 ? (
                                searchedChannels.map((channel: any) => (
                                    <div
                                        key={channel.id}
                                        className="p-3 hover:bg-[#2c2e3b] rounded-md cursor-pointer"
                                        onClick={() => {
                                            setSelectedChatType("channel");

                                            // check if channel already exists before adding
                                            const existingChannels = useAppStore.getState().channels;
                                            const isAlreadyAdded = existingChannels.some((ch: any) => ch.id === channel.id);

                                            if (!isAlreadyAdded) {
                                                addChannels(channel);
                                            }
                                            setSelectedChatData(channel)
                                            setOpenChannelSearchModal(false);
                                            setSearchedChannels([]);
                                            setSearchTerm("");
                                        }}

                                    >
                                        <div className="flex gap-3 items-center">
                                            <div className="bg-[#ffffff22] h-10 w-10 flex items-center justify-center overflow-hidden rounded-full">
                                                #
                                            </div>
                                            <p className="text-white text-sm">{channel.name}</p>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <p className="text-xs text-neutral-400">
                                                            {channel.members.length} members
                                                        </p>
                                                    </TooltipTrigger>
                                                    <TooltipContent className='bg-[#1c1b1e] border-none text-white p-4'>
                                                        {channel.members.map((member: any, idx: number) => (
                                                            <div key={idx}>
                                                                {member.firstName} {member.lastName}
                                                            </div>
                                                        ))}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-neutral-500 text-center mt-6">No channels found.</div>
                            )}
                        </ScrollArea>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </>
    );
}

export default CreateChannel;
