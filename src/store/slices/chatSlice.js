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
    setChannels: (channels) => set({ channels }),
    setIsUploading: (isUploading) => set({ isUploading }),
    setIsDownloading: (isDownloading) => set({ isDownloading }),
    setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
    setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
    setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
    setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
    setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
    setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),
    closeChat: () => set({ selectedChatData: undefined, selectedChatType: undefined, selectedChatMessages: [] }),
    addChannels: (channel) => {
        const channels = get().channels;
        set({ channels: [channel, ...channels] })
    },
    addMessage: (message) => {
        set((state) => {
            const updatedMessages = [
                ...state.selectedChatMessages,
                {
                    ...message,
                    recipient: state.selectedChatType === "channel" ? message.recipient : message.recipient.id,
                    sender: state.selectedChatType === "channel" ? message.sender : message.sender.id,
                }
            ];
            return { selectedChatMessages: updatedMessages };
        });
    }
});