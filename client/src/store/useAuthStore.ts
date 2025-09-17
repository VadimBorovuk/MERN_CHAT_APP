import {create} from 'zustand'
import {axiosInstance} from "../lib/axios";
import {IFormDataSignup} from "../pages/SignUpPage";
import toast from "react-hot-toast";
import {IFormDataLogin} from "../pages/LoginPage";
import {TypeProfileData} from "../pages/ProfilePage";
import {io} from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5004" : "/apiRender"

export const useAuthStore = create((set, get) => ({
      authUser: null,
      isSigningUp: false,
      isLoggingIng: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,
      onlineUsers: [],

      socket: null,

      checkAuth: async () => {
        try {
          const response = await axiosInstance.get("/auth/check")
          set({authUser: response.data})
          get().connectSocket()

        } catch (e) {
          set({authUser: null})
        } finally {
          set({isCheckingAuth: false})
        }
      },

      signUp: async (data: IFormDataSignup) => {
        set({isSigningUp: true})
        try {
          await axiosInstance.post("/auth/signup", data);
          set({authUser: true})
          toast.success("Account created successfully");
          get().connectSocket()
        } catch (e) {
          toast.error(e.response.data.message);
        } finally {
          set({isSigningUp: false})
        }
      },

      login: async (data: IFormDataLogin) => {
        set({isLoggingIng: true})
        try {
          const response = await axiosInstance.post("/auth/login", data);
          set({authUser: response.data})
          toast.success("Account created successfully");
          get().connectSocket()
        } catch (e) {
          toast.error(e.response.data.message);
        } finally {
          set({isLoggingIng: false})
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          set({authUser: null})
          toast.success("Logged out successfully");
          get().disconnectSocket()
        } catch (e) {
          toast.error(e.response.data.message);
        }
      },

      updateProfile: async (data: TypeProfileData) => {
        set({isUpdatingProfile: true})
        try {
          const response = await axiosInstance.put("/auth/update-profile", data);
          set({authUser: response.data})
          toast.success("Avatar updated successfully");
        } catch (e) {
          toast.error(e.response.data.message);
        } finally {
          set({isUpdatingProfile: false})
        }
      },

      connectSocket: () => {
        const {authUser} = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id
          }
        })
        socket.connect()
        set({socket})
        socket.on("getOnlineUsers", (userIds) => {
          set({onlineUsers: userIds})
        })
      },
      disconnectSocket: () => {
        if (get().socket?.connected) {
          get().socket?.disconnect();
        }
      }
    })
)
