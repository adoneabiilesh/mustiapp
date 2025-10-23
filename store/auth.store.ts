import { create } from 'zustand';
import {User} from "@/type";
import {getCurrentUser, initializeUserProfile} from "@/lib/supabase";

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;

    setIsAuthenticated: (value: boolean) => void;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;

    fetchAuthenticatedUser: () => Promise<void>;
    logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    isLoading: true,

    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    setUser: (user) => set({ user }),
    setLoading: (value) => set({isLoading: value}),

    fetchAuthenticatedUser: async () => {
        set({isLoading: true});

        try {
            const user = await getCurrentUser();

            if(user) {
                // Initialize user profile in database
                await initializeUserProfile(user.$id, {
                    name: user.name || 'User',
                    email: user.email || '',
                    avatar: user.avatar,
                });
                
                set({ isAuthenticated: true, user: user as User });
            } else {
                set( { isAuthenticated: false, user: null } );
            }
        } catch (e) {
            console.log('fetchAuthenticatedUser error', e);
            set({ isAuthenticated: false, user: null })
        } finally {
            set({ isLoading: false });
        }
    },

    logout: () => {
        set({ isAuthenticated: false, user: null });
    }
}))

export default useAuthStore;
