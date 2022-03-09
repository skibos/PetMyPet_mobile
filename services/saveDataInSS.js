import * as SecureStore from 'expo-secure-store';

const saveDataInSS = async(key, value) => {
    await SecureStore.setItemAsync(key, value);
}

export default saveDataInSS;


