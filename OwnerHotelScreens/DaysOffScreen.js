import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Image, FlatList, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../services/axiosInstanceConfig';
import deleteDayOff from '../services/deleteDayOff';
import getAnimalTypes from '../storage/getAnimalTypes'
import EmptyList from '../components/EmptyList';
import getDayOffByHotel from '../services/getDayOffByHotel';
import AsyncStorage from '@react-native-async-storage/async-storage';


const DaysOffScreen = ({ route, navigation, props }) => {

    const [data, setData] = useState([]);
    const [typeAnimals, setTypeAnimals] = useState();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async() => {
            getAnimalTypes().then(res => setTypeAnimals(res))
            try {
                const id = await AsyncStorage.getItem('editHotelId')
                if(id !== null) {
                    getDayOffByHotel(parseInt(id)).then(res => setData(res))
                }
            } catch(e) {
                console.log(e)
            }
        })
        return unsubscribe;
    }, [navigation, data, typeAnimals])
    
    const SingleDay = ({ item }) => {

        return (
        <View style={styles.singleReservation}>
            <View style={styles.informationSingleReservationContainer}>

                <View style={styles.informations}>
                        <Text style={styles.informationHotelName}>Typ: {typeAnimals[item.animalType]}</Text>
                    <View style={styles.paddingToText}>
                        <Text style={styles.informationDatePrice}>Zamknięty od: {item.startingDate}</Text>
                        <Text style={styles.informationDatePrice}>Zamknięty do: {item.endingDate}</Text>
                    </View>
                </View>
                <View style={styles.button}>
                    <TouchableWithoutFeedback onPress={() => {
                        Alert.alert(
                            '',
                            'Czy na pewno chcesz usunąć ten dzień wolny?',
                            [
                                { text: "Zamknij", style: "cancel" },
                                { text: "Usuń", onPress: () => {                                    
                                    deleteDayOff(item.id);
                                    setData(data.filter((el) => el.id != item.id));
                                }},
                            ]
                        )
                    }}>
                        <Icon name="close" size={30} color="black"/>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </View>
        );
    }

    const renderDay = ({ item }) => (
          <SingleDay
            item={item}
          />
    );
    
    return (

            <View style={styles.screen}>
                    <FlatList
                        data={data}
                        renderItem={renderDay}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={<EmptyList message="Brak wpisanych dni wolnych!" />}
                    />
            </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    singleReservation:{
        flex:1,
        marginTop: 10,
        padding: 10,
        backgroundColor: "#F5F5F5",
        flexDirection: "column",
    },
    informationSingleReservationContainer:{
        flex:2,
        padding: 10,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "lightgrey",
        borderRadius: 8,
        //backgroundColor: "blue"
    },
    photoContainer:{
        flex:2,
        paddingRight: 10,
        paddingTop: 5,
        paddingBottom: 15,
    },
    paddingToText:{
        marginTop: 5,
    },
    photo:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    informations:{
        flex:6,
    },
    button:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerCityText:{
        fontSize: 16,
        fontFamily: "OpenSans_700Bold",
    },
    headerDateText:{
        fontFamily: "OpenSans_400Regular",
        color: "grey",
    },
    informationHotelName:{
        fontFamily: "OpenSans_600SemiBold",
    },
    informationDatePrice:{
        paddingVertical: 2,
        fontFamily: "OpenSans_400Regular",
    },
    informationStatus:{
        fontFamily: "OpenSans_400Regular",
        color: "#E0E629"
    }
});

export default DaysOffScreen;