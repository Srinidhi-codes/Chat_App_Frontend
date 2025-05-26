'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"
import { Input } from "@/components/ui/input"
import dynamic from 'next/dynamic';
const Lottie = dynamic(() => import('react-lottie'), { ssr: false });
import { animationDefaultOptions, getColor } from "@/lib/utils"
import { Poppins } from "next/font/google"
import { GET_SEARCH_TERM } from '../../graphql/query'
import { useLazyQuery } from "@apollo/client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/store"

const poppinsFont = Poppins({
    subsets: ["latin"],
    weight: "400"
});

function NewDM() {
    const [openNewConatctModal, setOpenNewConatctModal] = useState(false);
    const [searchedContacts, setSearchedContacts] = useState([]);
    const [fetchSearchTerm, { data: fetchedData }] = useLazyQuery(GET_SEARCH_TERM);
    const { setSelectedChatType, setSelectedChatData } = useAppStore();
    const searchContacts = async (searchTerm: any) => {
        if (searchTerm.trim() !== '') {
            try {
                const { data } = await fetchSearchTerm({
                    variables: { searchTerm }
                });
                setSearchedContacts(data.searchContact || []);
            } catch (err) {
                console.error('Error fetching contacts:', err);
                setSearchedContacts([]);
            }
        } else {
            setSearchedContacts([]);
        }
    };

    const selectNewContact = (contact: any) => {
        setOpenNewConatctModal(false);
        setSearchedContacts([]);
        setSelectedChatType("contact");
        setSelectedChatData(contact);
    }
    return (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger><FaPlus className='text-neutral-500 cursor-pointer text-start font-light hover:text-neutral-100 transition-all duration-300' onClick={() => setOpenNewConatctModal(true)} /></TooltipTrigger>
                    <TooltipContent className='bg-[#1c1b1e] border-none text-white p-4 mb-2'>
                        Select New Contact
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <Dialog open={openNewConatctModal} onOpenChange={setOpenNewConatctModal}>
                <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Please select a contact</DialogTitle>
                        <DialogDescription>
                        </DialogDescription>
                        <div><Input placeholder="Search Contacts" className="rounded-lg p-6 bg-[#2c2e3b] border-none" onChange={(e) => searchContacts(e.target.value)} /></div>
                        {searchedContacts.length > 0 ? (
                            searchedContacts.map((contact: any) => (
                                <div
                                    key={contact.id}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#2c2e3b] transition-all cursor-pointer"
                                    onClick={() => selectNewContact(contact)}
                                >
                                    <div className="w-12 h-12 relative">
                                        <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                                            {contact?.image ? (
                                                <AvatarImage
                                                    src={contact.image}
                                                    alt="profile"
                                                    className="object-cover w-full h-full bg-black"
                                                />
                                            ) : (
                                                <div
                                                    className={`uppercase h-12 w-12 text-lg border flex items-center justify-center rounded-full ${getColor(contact?.color)}`}
                                                >
                                                    {contact?.firstName
                                                        ? contact?.firstName.charAt(0)
                                                        : contact?.email?.charAt(0)}
                                                </div>
                                            )}
                                        </Avatar>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white">
                                            {contact?.firstName && contact?.lastName
                                                ? `${contact.firstName} ${contact.lastName}`
                                                : contact?.email}
                                        </span>
                                        <span className="text-xs text-neutral-400">{contact?.email}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 md:bg-[#1c1d25] mt-15 md:flex flex-col justify-center items-center hidden duration-1000 transition-all">
                                <Lottie
                                    isClickToPauseDisabled={true}
                                    height={100}
                                    width={100}
                                    options={animationDefaultOptions}
                                />
                                <div className="text-opacity-80 text-white flex flex-col justify-center items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
                                    <h3 className={`${poppinsFont.className}`}>
                                        Hi<span className="text-purple-500">!</span> Search new
                                        <span className="text-purple-500"> Contact</span>.
                                    </h3>
                                </div>
                            </div>
                        )}

                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </>
    )
}

export default NewDM