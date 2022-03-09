import * as SecureStore from 'expo-secure-store';

export default async function getSecureUsernameAndPass(){
    return {
        username: await SecureStore.getItemAsync('username'),
        password: await SecureStore.getItemAsync('password'),
    }
}