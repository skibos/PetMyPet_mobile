import * as SecureStore from 'expo-secure-store';

export default async function getSecureData(){

    return {
        username: await SecureStore.getItemAsync('username'),
        authority: await SecureStore.getItemAsync('authority'),
        token: await SecureStore.getItemAsync('token')
    }
}