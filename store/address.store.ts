import { create } from 'zustand';
import { updateDefaultAddress, getUserPreferences } from '@/lib/userPreferences';

export interface Address {
  id?: string;
  name: string;
  address: string;
  type?: 'home' | 'work' | 'other';
  isDefault?: boolean;
}

interface AddressStore {
  addresses: Address[];
  defaultAddress: Address | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadAddresses: (userId: string) => Promise<void>;
  addAddress: (userId: string, address: Address) => Promise<void>;
  updateAddress: (userId: string, addressId: string, address: Address) => Promise<void>;
  deleteAddress: (userId: string, addressId: string) => Promise<void>;
  setDefaultAddress: (userId: string, addressId: string) => Promise<void>;
  clearError: () => void;
}

export const useAddressStore = create<AddressStore>((set, get) => ({
  addresses: [],
  defaultAddress: null,
  loading: false,
  error: null,

  loadAddresses: async (userId: string) => {
    try {
      console.log('=== LOAD ADDRESSES DEBUG ===');
      console.log('Loading addresses for userId:', userId);
      
      set({ loading: true, error: null });
      
      const preferences = await getUserPreferences(userId);
      console.log('getUserPreferences result:', preferences);
      
      if (preferences?.default_address) {
        const defaultAddr: Address = {
          id: 'default',
          ...preferences.default_address,
          isDefault: true,
        };
        
        console.log('Setting default address:', defaultAddr);
        set({ 
          addresses: [defaultAddr],
          defaultAddress: defaultAddr,
          loading: false 
        });
      } else {
        console.log('No default address found');
        set({ 
          addresses: [],
          defaultAddress: null,
          loading: false 
        });
      }
    } catch (error: any) {
      console.error('Load addresses error:', error);
      set({ 
        error: error.message || 'Failed to load addresses',
        loading: false 
      });
    }
  },

  addAddress: async (userId: string, address: Address) => {
    try {
      console.log('=== ADDRESS STORE DEBUG ===');
      console.log('addAddress called with userId:', userId);
      console.log('addAddress called with address:', address);
      
      set({ loading: true, error: null });
      
      // Update the default address in the database
      console.log('Calling updateDefaultAddress...');
      const { error } = await updateDefaultAddress(userId, {
        name: address.name,
        address: address.address,
        type: address.type,
      });

      console.log('updateDefaultAddress result:', { error });

      if (error) throw error;

      console.log('Reloading addresses...');
      // Reload addresses to get updated data
      await get().loadAddresses(userId);
      console.log('Addresses reloaded successfully');
      
    } catch (error: any) {
      console.error('Add address error:', error);
      set({ 
        error: error.message || 'Failed to add address',
        loading: false 
      });
    }
  },

  updateAddress: async (userId: string, addressId: string, address: Address) => {
    try {
      set({ loading: true, error: null });
      
      // For now, we only support one default address
      // In the future, this could be expanded to support multiple addresses
      const { error } = await updateDefaultAddress(userId, {
        name: address.name,
        address: address.address,
        type: address.type,
      });

      if (error) throw error;

      // Reload addresses to get updated data
      await get().loadAddresses(userId);
      
    } catch (error: any) {
      console.error('Update address error:', error);
      set({ 
        error: error.message || 'Failed to update address',
        loading: false 
      });
    }
  },

  deleteAddress: async (userId: string, addressId: string) => {
    try {
      set({ loading: true, error: null });
      
      // For now, we only support one default address
      // In the future, this could be expanded to support multiple addresses
      const { error } = await updateDefaultAddress(userId, {
        name: '',
        address: '',
        type: 'home',
      });

      if (error) throw error;

      // Reload addresses to get updated data
      await get().loadAddresses(userId);
      
    } catch (error: any) {
      console.error('Delete address error:', error);
      set({ 
        error: error.message || 'Failed to delete address',
        loading: false 
      });
    }
  },

  setDefaultAddress: async (userId: string, addressId: string) => {
    try {
      set({ loading: true, error: null });
      
      const { addresses } = get();
      const address = addresses.find(addr => addr.id === addressId);
      
      if (!address) {
        throw new Error('Address not found');
      }

      // Update the default address in the database
      const { error } = await updateDefaultAddress(userId, {
        name: address.name,
        address: address.address,
        type: address.type,
      });

      if (error) throw error;

      // Reload addresses to get updated data
      await get().loadAddresses(userId);
      
    } catch (error: any) {
      console.error('Set default address error:', error);
      set({ 
        error: error.message || 'Failed to set default address',
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
