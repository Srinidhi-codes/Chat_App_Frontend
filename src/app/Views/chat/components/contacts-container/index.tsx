import { useEffect } from "react"
import NewDM from "./components/new-dm"
import ProfileInfo from "./components/profile-info"
import { useLazyQuery } from "@apollo/client";
import { GET_CONTACTS_FOR_DM_LIST, GET_USER_CHANNELS } from './graphql/query';
import { useAppStore } from "@/store";
import ContactList from "@/components/contact-list"
import CreateChannel from "./components/create-channel";

const ContactsContainer = () => {
    const [fetchContactsForDMList, { data: fetchedContactsForDMList }] = useLazyQuery(GET_CONTACTS_FOR_DM_LIST);
    const [fetchUserChannels, { data: fetchedUserChannels }] = useLazyQuery(GET_USER_CHANNELS);
    const { setDirectMessagesContacts, directMessagesContacts, channels, setChannels } = useAppStore();
    // Fetch on mount
    useEffect(() => {
        fetchContactsForDMList()
        fetchUserChannels()
    }, [fetchContactsForDMList, fetchUserChannels])

    // Update store when data is received
    useEffect(() => {
        if (fetchedContactsForDMList?.getContactsForDMList) {
            setDirectMessagesContacts(fetchedContactsForDMList.getContactsForDMList)
        }
        if (fetchedUserChannels?.getUserChannels?.channels) {
            setChannels(fetchedUserChannels?.getUserChannels?.channels);
        }
    }, [fetchedContactsForDMList, setDirectMessagesContacts, fetchedUserChannels, setChannels])

    return (
        <div className="relative flex flex-col items-start md:w-[35vw] lg:w-[30vw] xl:w-[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
            <div className="pt-3">
                {/* {Logo} */}
            </div>
            <div className="my-5 w-full">
                <div className="flex items-center justify-between pr-10 gap-5">
                    <Title text='Direct Messages' />
                    <NewDM />
                </div>
                {directMessagesContacts ? <div className="max-h-[38vh] overflow-y-auto scroll-hidden w-full">
                    <ContactList isChannel={false} />
                </div> :
                    <div className="text-center p-2">
                        Please click on <span className="animate-pulse text-xl px-2 font-bold">+</span> to start chat & socialize
                    </div>}
            </div>
            <div className="my-5 w-full">
                <div className="flex items-center justify-between pr-10 gap-5">
                    <Title text='Channels' />
                    <CreateChannel />
                </div>
                {channels ? <div className="max-h-[38vh] overflow-y-auto scroll-hidden w-full">
                    <ContactList isChannel={true} />
                </div> :
                    <div className="text-center p-2">
                        Please click on <span className="animate-pulse text-xl px-2 font-bold">+</span> to start new Channel
                    </div>}
            </div>
            <ProfileInfo />
        </div>
    )
}

export default ContactsContainer

const Title = ({ text }: any) => {
    return (
        <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-sm">
            {text}
        </h6>
    )
}