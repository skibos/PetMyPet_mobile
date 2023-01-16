import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, FlatList, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getUserPets from '../services/getUserPets';
import deleteAnimal from '../services/deleteAnimal';
import { useTheme } from '@react-navigation/native';
import EmptyList from '../components/EmptyList'

const ListOfPetsScreen = ({ navigation, route }) => {
    const { colors } = useTheme();
    const [pets, setPets] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getUserPets().then(data => {
                if(data !== null && data !== undefined){
                data.forEach(async(pet) => {
                    if(!pets.some(el => el.id == pet.id)){
                        setPets(prevState => [pet, ...prevState]);
                    }
                })
            }
            else{
                setPets([]);
            }
            });
        });
            
        return unsubscribe;
    }, [navigation, pets, route.params?.editPet, route.params?.addPet]);

    
    
    useEffect(() => {
        if (route.params?.editPet) { /* if edited, edit on list and reset params */
            let array = [...pets];
            let objIndex = array.findIndex((obj => obj.id == route.params.editPet.id));
            array[objIndex] = route.params.editPet;
            setPets(array);
        }
    }, [route.params?.editPet, route.params?.addPet]);

    const chooseIcon = (type) => {
        switch(type){
            case 1:
                return(
                    <Image 
                        source={require('../assets/cat.png')}
                        style={{width: "80%", height: "80%", }}
                    />
                );
            case 2:
                return(
                    <Image 
                        source={require('../assets/dog.png')}
                        style={{width: "70%", height: "70%", }}
                    />
                );
            case 3:
                return(
                    <Image 
                        source={require('../assets/bird.png')}
                        style={{width: "80%", height: "80%", }}
                    />
                );
            case 4:
                return(
                    <Image 
                        source={require('../assets/chameleon.png')}
                        style={{width: "80%", height: "80%", }}
                    />
                );
            case 5:
                return(
                    <Image 
                    source={require('../assets/track.png')}
                    style={{width: "80%", height: "80%", }}
                />
                );
        }
    }

    const SinglePet = ({ item, navigation }) => (
        <View style={styles.singleElement}>
            <View style={styles.singleElementCon}>
                <View style={styles.photoContainer}>
                    <View style={styles.photo}>
                        {chooseIcon(item.animalType)}
                    </View>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>{item.name}</Text>
                </View>
                <View style={styles.editDeleteContainer}>
                    <View style={styles.editContainer}>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate("EditPet",
                            {
                                id: item.id,
                                name: item.name,
                                weight: item.weight,
                                animalType: item.animalType,
                                birthDate: item.birthDate,
                                notes: item.notes,
                                vaccinations: item.vaccinations,
                                visibility: item.visibility,
                                owner: item.owner,
                                accommodatedIn : item.accommodatedIn
                            })
                        }}>
                            <View style={[styles.edit, {backgroundColor: colors.primary}]}>
                                <Text style={styles.buttonText}>Edytuj</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.deleteContainer}>
                        <TouchableOpacity 
                            onPress={() => {
                            deleteAnimal(item.id)
                            setPets(pets.filter(({id}) => id != item.id));
                            }}
                            style={styles.buttonText}
                        >
                            <View style={styles.delete}>
                                <Text>Usuń</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderPet = ({ item }) => (
          <SinglePet
            item={item}
            navigation={navigation}
          />
    );
    
    return (
            <View style={styles.screen}>
                <FlatList
                    data={pets}
                    numColumns={2}
                    renderItem={renderPet}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<EmptyList message="Twoja lista zwierząt jest pusta!"/>}
                />
            </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "white"
    },
    singleElement:{ /* double container for fix problem with odd count of elements */
        flex:0.5,
    },
    singleElementCon:{
        flex:1,
        margin: 10,
        backgroundColor: "#f5f5f5",
        flexDirection: "column",
        borderRadius: 12,
    },
    photoContainer: {
        flex:2,
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
    },
    photo:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#dcdcdc",
        height: 60,
        width: 60,
        borderRadius: 30,
    },
    textContainer: {
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        padding:10,
    },
    text:{
        color: "black",
        fontFamily: "OpenSans_400Regular"
    },
    editDeleteContainer: {
        flex:1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding:10,
    },
    editContainer:{
        flex:1,
        margin:5,
    },
    edit:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "lightgreen",
        padding:10,
        borderRadius:12,
    },
    deleteContainer:{
        flex:1,
        margin:5,
    },
    delete:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "salmon",
        padding:10,
        borderRadius:12,
    },
    buttonText:{
        fontFamily: "OpenSans_600SemiBold"
    },
});

export default ListOfPetsScreen;