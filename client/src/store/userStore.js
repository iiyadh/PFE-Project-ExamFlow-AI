import api from '../lib/api';
import { create  } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(persist((set) => ({
    username: null,
    status: null,
    pfpUrl: null,
    numTel: null,
    lastLogin: null,
    address: null,


    setUsername: (username) => set({ username }),
    setStatus: (status) => set({ status }),
    setPfpUrl: (pfpUrl) => set({ pfpUrl }),
    setNumTel: (numTel) => set({ numTel }),
    setLastLogin: (lastLogin) => set({ lastLogin }),
    setAddress: (address) => set({ address }),

    fetchUserData: async () => {
        try {
            const res = await api.get('/user/profile');
            const { username, status, pfpUrl, numTel, lastLogin, address } = res.data;
            set({ username, status, pfpUrl, numTel, lastLogin, address });
        } catch (err) {
            throw err;
        }
    },
    
}), {
    name: 'user-storage',
}));