import { Role, UserDocument } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";



interface UserStore {
  user: UserDocument | null;
  setUser: (user: UserDocument) => void;
  clearUser: () => void;
  logout: () => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      logout: () => set({ user: null }),
      
    }),
    {
      name: 'user-storage',
    }
  )
);

export default useUserStore;