import {create} from "zustand/index";
import toast from "react-hot-toast";
import {axiosInstance} from "../lib/axios";
import {useAuthStore} from "./useAuthStore";

export const useChatStore = create((set, get) => ({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,

      getUsers: async () => {
        set({isUsersLoading: true})

        try {
          const response = await axiosInstance.get('/messages/users');
          set({users: response.data})
        } catch (e) {
          toast.error(e.response.data.message);
        } finally {
          set({isUsersLoading: false})
        }
      },

      getMessages: async (userId) => {
        set({isMessagesLoading: true})

        try {
          const response = await axiosInstance.get(`/messages/${userId}`);
          set({messages: response.data})
        } catch (e) {
          toast.error(e.response.data.message);
        } finally {
          set({isMessagesLoading: false})
        }
      },

      sendMessage: async (messageData) => {
        // set({isMessagesLoading: true})
        const {selectedUser, messages} = get()
        try {
          const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
          set({messages: [...messages, response.data]})
        } catch (e) {
          toast.error(e.response.data.message);
        } finally {
          set({isMessagesLoading: false})
        }
      },

      subscribeToMessages: async () => {
        const {selectedUser} = get();
        if (!selectedUser) return;

        const socket = useAuthStore?.getState?.()?.socket;

        socket.on('newMessage', (newMessage) => {
          const isMessageSendFromSelectedUser = newMessage.senderId === selectedUser._id
          if (!isMessageSendFromSelectedUser) return;
          set({messages: [...get().messages, newMessage]})
        })
      },
      unSubscribeToMessages: () => {
        const socket = useAuthStore?.getState?.()?.socket;
        socket.off('newMessage')
      },

      setSelectedUser: (selectedUser) => {
        set({selectedUser})
      }
    })
)
