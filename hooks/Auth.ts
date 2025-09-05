import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

type AuthState = {
    jwt: string | null;
    setJwt: (token: string | null) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    jwt: null,
    setJwt: async (token) => {
        if (token) {
            await SecureStore.setItemAsync("jwt", token);
        } else {
            await SecureStore.deleteItemAsync("jwt");
        }
        set({ jwt: token });
    },
}));
