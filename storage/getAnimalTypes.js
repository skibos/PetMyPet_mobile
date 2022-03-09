import AsyncStorage from '@react-native-async-storage/async-storage';

const getAnimalTypes = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('animalTypes')
        return jsonValue != null ? JSON.parse(jsonValue) : null;  
    } 
    catch(e) {    // error reading value  
        console.log(e)
    }
}

export default getAnimalTypes;