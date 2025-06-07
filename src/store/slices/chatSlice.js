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
    isChatOpen: false,
    refreshChat: 0,
    unreadCountsContacts: {},
    unreadCountsChannels: {},
    editingMessageId: null,
    editingMessageContent: '',
    setEditingMessage: (id, content) => {
        set({ editingMessageId: id, editingMessageContent: content });
    },



    setRefreshChat: (v) => set({ refreshChat: v }),


    setOnlineUsers: (updater) =>
        set((state) => ({
            onlineUsers: typeof updater === 'function' ? updater(state.onlineUsers) : updater,
        })),

    setIsOtherProfile: (val) => set({ isOtherProfile: val }),
    setIsChatOpen: (val) => set({ isChatOpen: val }),
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
            isChatOpen: false,
        }),

    resetChatState: () =>
        set({
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
            isChatOpen: false,
            refreshChat: 0,
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
    addChannelInChannelList: (message) => {
        const channels = get().channels;
        const data = channels.find((channel) => channel.id === message.channelId);
        const index = channels.findIndex((channel) => channel.id === message.channelId)
        if (index !== -1 && index !== undefined) {
            channels.splice(index, 1);
            channels.unshift(data);
        }
    },
    addContactsInDMContacts: (message) => {
        const userId = get().userInfo.id;
        const fromId = message.sender.id === userId ? message.recipient.id : message.sender.id;
        const fromData = message.sender.id === userId ? message.recipient : message.sender;
        const dmContacts = get().directMessagesContacts;
        const data = dmContacts.find((contact) => contact.id === fromId);
        const index = dmContacts.findIndex((contact) => contact.id === fromId);
        if (index !== -1 && index !== undefined) {
            dmContacts.splice(index, 1);
            dmContacts.unshift(data);
        } else {
            dmContacts.unshift(fromData);
        }
        set({ directMessagesContacts: dmContacts });
    },

    incrementUnreadCountContact: (contactId) =>
        set((state) => {
            if (state.selectedChatType === 'contact' && state.selectedChatData?.id === contactId) {
                // Chat is open, no increment
                return {};
            }
            const prevCount = state.unreadCountsContacts[contactId] || 0;
            return {
                unreadCountsContacts: {
                    ...state.unreadCountsContacts,
                    [contactId]: prevCount + 1,
                },
            };
        }),

    resetUnreadCountContact: (contactId) =>
        set((state) => ({
            unreadCountsContacts: {
                ...state.unreadCountsContacts,
                [contactId]: 0,
            },
        })),

    incrementUnreadCountChannel: (channelId) =>
        set((state) => {
            if (state.selectedChatType === 'channel' && state.selectedChatData?.id === channelId) {
                return {};
            }
            const prevCount = state.unreadCountsChannels[channelId] || 0;
            return {
                unreadCountsChannels: {
                    ...state.unreadCountsChannels,
                    [channelId]: prevCount + 1,
                },
            };
        }),

    resetUnreadCountChannel: (channelId) =>
        set((state) => ({
            unreadCountsChannels: {
                ...state.unreadCountsChannels,
                [channelId]: 0,
            },
        })),

    // Update setSelectedChatData to reset unread count on chat select
    setSelectedChatData: (selectedChatData) => {
        set((state) => {
            if (!selectedChatData) return { selectedChatData: undefined };

            if (state.selectedChatType === 'contact') {
                return {
                    selectedChatData,
                    unreadCountsContacts: {
                        ...state.unreadCountsContacts,
                        [selectedChatData.id]: 0,
                    },
                };
            } else if (state.selectedChatType === 'channel') {
                return {
                    selectedChatData,
                    unreadCountsChannels: {
                        ...state.unreadCountsChannels,
                        [selectedChatData.id]: 0,
                    },
                };
            }
            return { selectedChatData };
        });
    },
});
