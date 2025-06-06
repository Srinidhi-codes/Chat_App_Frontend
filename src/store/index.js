"use client"
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuthSlice } from './slices/authSlice';
import { createChatSlice } from './slices/chatSlice';
import { createUserSlice } from './slices/userSlice';

export const useAppStore = create(
    persist(
        (...a) => ({
            ...createAuthSlice(...a),
            ...createChatSlice(...a),
            ...createUserSlice(...a),
        }),
        {
            name: 'app-store', // Persist to localStorage with this key
            getStorage: () => localStorage, // You can use sessionStorage if needed
        }
    )
);
