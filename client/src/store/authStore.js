import api from '../lib/api';
import { create  } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(persist((set) => ({
    role: null,
    isAuthenticated: false,

    setRole: (role) => set({ role }),
    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

    register: async (data) => {
        try {
            const res = await api.post('/auth/register', data);
            set({ role: res.data.role });
            set({ isAuthenticated: true });
        } catch (err) {
            throw err;
        }
    },

    login: async (data)=>{
        try{
            const res = await api.post('/auth/login', data);
            set({ role: res.data.role });
            set({ isAuthenticated: true });
        }catch(err){
            throw err;
        }
    },

    logout: async () => {
        try{
            await api.post('/auth/logout');
            set({ role: null });
            set({ isAuthenticated: false });
        }catch(err){
            throw err;
        }
    },


    signWithGoogle: async (token) => {
        try {
            const res = await api.post(`/auth/google/${token}`);
            set({ role: res.data.role });
            set({ isAuthenticated: true });
        } catch (err) {
            throw err;
        }
    },
    
    checkAuth: async () => {
        try {
            const res = await api.get('/auth/checkAuth');
            console.log(res.data);
            set({ isAuthenticated: res.data.isAuthenticated });
            set({ role: res.data.role });
            return res;
        } catch (err) {
            throw err;
        }
    },

}), {
    name: 'auth-storage',
    
}));