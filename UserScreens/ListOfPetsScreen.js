import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableHighlight, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getUserPets from '../services/getUserPets';
import deleteAnimal from '../services/deleteAnimal';

const ListOfPetsScreen = ({ navigation, route }) => {
    const [pets, setPets] = useState([]);

    useEffect(() => {
        getUserPets().then(data => setPets(data));
    }, []);

    useEffect(() => {
        if (route.params?.editPet) { /* if edited, edit on list and reset params */
            let array = [...pets];
            let objIndex = array.findIndex((obj => obj.id == route.params.editPet.id));
            array[objIndex] = route.params.editPet;
            setPets(array);
        }
        else if(route.params?.addPet){
            setPets(previousState => [route.params?.addPet, ...previousState]);
        }
    }, [route.params?.editPet, route.params?.addPet]);

    const SinglePet = ({ item, navigation }) => (
        <View style={styles.singleElement}>
            <View style={styles.photoContainer}>
                <Text>Fotka</Text>
            </View>
            <View style={styles.textContainer}>
                <Text>{item.name}</Text>
            </View>
            <View style={styles.editDeleteContainer}>
                <View style={styles.edit}>
                    <Icon name="pencil-box" size={45} onPress={() => {
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
                    }}/>
                </View>
                <View style={styles.delete}>
                    <Icon name="close-box" size={45} color="red" onPress={() => {
                            deleteAnimal(item.id)
                            setPets(pets.filter(({id}) => id != item.id));
                        }}/>
                </View>
            </View>
        </View>
    );

    const Button = () => (
        <View>
            <TouchableHighlight onPress={() => {navigation.navigate('AddPet')}}>
                <View style={styles.button}>
                    <Text>Dodaj zwierzę</Text>
                </View>
            </TouchableHighlight>
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
                    renderItem={renderPet}
                    keyExtractor={(item) => item.id}
                    ListFooterComponent={<Button/>}
                    ListFooterComponentStyle={styles.buttons}
                    contentContainerStyle={styles.flatListStyle}
                />
            </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    singleElement:{
        marginTop: 10,
        padding: 10,
        backgroundColor: "#DCDCDC",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
    },
    photoContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "aqua",
        height: 80,
        borderRadius: 30,
    },
    textContainer: {
        flex: 2,
        backgroundColor: "lightgreen",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 20,
        height: 40,
    },
    editDeleteContainer: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    flatListStyle: {
        flexGrow: 1,
    },
    buttons: {
        flex:1, 
        justifyContent: 'flex-end'
    },
    button: {
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
        height: 40,
        marginVertical: 10,
    }
});

export default ListOfPetsScreen;