import api from '../lib/api';
import { create  } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(persist((set) => ({
    username: null,
    status: null,
    email : null,
    pfpUrl: null,
    numTel: null,
    lastLogin: null,
    address: null,
    googleId: null,


    setUsername: (username) => set({ username }),
    setStatus: (status) => set({ status }),
    setPfpUrl: (pfpUrl) => set({ pfpUrl }),
    setNumTel: (numTel) => set({ numTel }),
    setLastLogin: (lastLogin) => set({ lastLogin }),
    setAddress: (address) => set({ address }),
    setEmail: (email) => set({ email }),
    setGoogleId: (googleId) => set({ googleId }),

    fetchUserData: async () => {
        try {
            const res = await api.get('/user/profile');
            const { username, status, pfpUrl, numTel, lastLogin, address , email , googleId } = res.data;
            set({ username, status, pfpUrl, numTel, lastLogin, address , email , googleId });
        } catch (err) {
            throw err;
        }
    },
    
}), {
    name: 'user-storage',
}));