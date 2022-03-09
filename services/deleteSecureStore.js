import * as SecureStore from 'expo-secure-store';

const deleteSecureStore = async(key) => {
    await SecureStore.deleteItemAsync(key);
}

export default deleteSecureStore;
