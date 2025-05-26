export const createChatSlice = (set, get) => ({
    selectedChatType: undefined,
    selectedChatData: undefined,
    selectedChatMessages: [],
    directMessagesContacts: [],
    isUploading: false,
    isDownloading: false,
    fileUploadProgress: 0,
    fileDownloadProgress: 0,
    channels: [],
    removedChannelIds: [],
    removedContactIds: [],
    isOtherProfile: false,
    otherProfileData: null,
    onlineUsers: [],

    setOnlineUsers: (updater) =>
        set((state) => ({
            onlineUsers: typeof updater === 'function' ? updater(state.onlineUsers) : updater,
        })),

    setIsOtherProfile: (val) => set({ isOtherProfile: val }),
    setOtherProfileData: (data) => set({ otherProfileData: data }),


    setDirectMessagesContacts: (updater) =>
        set((state) => {
            const newContacts =
                typeof updater === "function"
                    ? updater(state.directMessagesContacts)
                    : updater;

            const selectedId = state.selectedChatData?.id;
            const updatedRemovedIds = selectedId
                ? state.removedContactIds.filter((id) => id !== selectedId)
                : state.removedContactIds;

            const filteredContacts = newContacts.filter(
                (contact) => !updatedRemovedIds.includes(contact.id)
            );

            return {
                directMessagesContacts: filteredContacts,
                removedContactIds: updatedRemovedIds,
            };
        }),

    setChannels: (updater) =>
        set((state) => {
            const newChannels =
                typeof updater === "function"
                    ? updater(state.channels)
                    : updater;

            const selectedId = state.selectedChatData?.id;
            const updatedRemovedIds = selectedId
                ? state.removedChannelIds.filter((id) => id !== selectedId)
                : state.removedChannelIds;

            const filteredChannels = newChannels?.filter(
                (channel) => !updatedRemovedIds.includes(channel.id)
            );

            return {
                channels: filteredChannels,
                removedChannelIds: updatedRemovedIds,
            };
        }),

    setRemovedContactIds: (updater) =>
        set((state) => ({
            removedContactIds:
                typeof updater === "function"
                    ? updater(state.removedContactIds)
                    : updater,
        })),

    removeContact: (contactId) => {
        const { closeChat } = get();

        set((state) => {
            const updatedContacts = state.directMessagesContacts.filter(c => c.id !== contactId);
            const updatedRemoved = state.removedContactIds.includes(contactId)
                ? state.removedContactIds
                : [...state.removedContactIds, contactId];

            if (state.selectedChatData?.id === contactId) {
                closeChat();
            }

            return {
                directMessagesContacts: updatedContacts,
                removedContactIds: updatedRemoved,
            };
        });
    },

    removeChannel: (channelId) => {
        const { closeChat } = get();

        set((state) => {
            const updatedChannels = state.channels.filter((c) => c.id !== channelId);
            const updatedRemoved = state.removedChannelIds.includes(channelId)
                ? state.removedChannelIds
                : [...state.removedChannelIds, channelId];

            if (state.selectedChatType === "channel" && state.selectedChatData?.id === channelId) {
                closeChat();
            }

            return {
                channels: updatedChannels,
                removedChannelIds: updatedRemoved,
            };
        });
    },

    setIsUploading: (isUploading) => set({ isUploading }),
    setIsDownloading: (isDownloading) => set({ isDownloading }),
    setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
    setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),

    setSelectedChatMessages: (updater) =>
        set((state) => ({
            selectedChatMessages:
                typeof updater === "function"
                    ? updater(state.selectedChatMessages)
                    : updater,
        })),

    closeChat: () =>
        set({
            selectedChatData: undefined,
            selectedChatType: undefined,
            selectedChatMessages: [],
        }),

    addChannels: (channel) => {
        set((state) => {
            const exists = state.channels.find((ch) => ch.id === channel.id);

            const updatedRemovedIds = state.removedChannelIds.filter((id) => id !== channel.id);
            const updatedChannels = exists
                ? state.channels.map((ch) => (ch.id === channel.id ? channel : ch))
                : [channel, ...state.channels];

            return {
                channels: updatedChannels,
                removedChannelIds: updatedRemovedIds,
            };
        });
    },



    addMessage: (message) => {
        set((state) => {
            const updatedMessages = [
                ...state.selectedChatMessages,
                {
                    ...message,
                    recipient:
                        state.selectedChatType === "channel"
                            ? message.recipient
                            : message.recipient.id,
                    sender:
                        state.selectedChatType === "channel" ? message.sender : message.sender.id,
                },
            ];
            return { selectedChatMessages: updatedMessages };
        });
    },
});
