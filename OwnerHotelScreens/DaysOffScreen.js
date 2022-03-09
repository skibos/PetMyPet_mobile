import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, TouchableHighlight, FlatList} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../services/axiosInstanceConfig';
import deleteDayOff from '../services/deleteDayOff';
import getAnimalTypes from '../storage/getAnimalTypes'
import EmptyList from '../components/EmptyList';

const DaysOffScreen = ({ route, navigation }) => {
    
    const [data, setData] = useState([]);
    const [typeAnimals, setTypeAnimals] = useState();

    useEffect(() => {
        if (route.params?.dayOff) { /* if added day off, add to list and reset params */
            setData(previousState => [route.params?.dayOff, ...previousState])
        }
    }, [route.params?.dayOff]);

    const SingleDay = ({ item }) => {

        return (
            <View style={styles.singleElement}>
                <View style={styles.textContainer}>
                    <Text>{item.startingDate} - {item.endingDate}</Text>
                    <Text style={{color:"black"}}>{typeAnimals[item.animalType]}</Text>
                    <View style={styles.hotelName}>
                        <Text style={{color:"black"}}>{item.hotelName}</Text>
                    </View>
                </View>
                <View style={styles.deleteButton}>
                    <Icon name="close-box" size={45} color="red" onPress={() => {
                        deleteDayOff(item.id)
                        setData(data.filter(({id}) => id != item.id));
                        }}/>
                </View>
            </View>
        );
    }

    useEffect(() => {
        getDataFromApi()
        getAnimalTypes().then(res => {
            setTypeAnimals(res);
        })
    }, [])


    const getDataFromApi = async() => {
        const username = await SecureStore.getItemAsync('username')/* put getusernameandpass when will be fixed */
        const token = await SecureStore.getItemAsync('token')
    
        axiosInstance.get('/api/closedDaysByOwner/' + username,
        {
            headers: {
                Cookie: "PetMyPetJWT=" + token,
            },
        },
            { withCredentials: true }
        )
            .then((response) => {
                setData(response.data.reverse());
            })
            .catch(function (error) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                  } else if (error.request) {
                      // The request was made but no response was received
                      // `error.request` is an instance of XMLHttpRequest in the 
                      // browser and an instance of
                      // http.ClientRequest in node.js
                      console.log(error.request);
                  } else {
                      // Something happened in setting up the request that triggered an Error
                      console.log('Error', error.message);
                  }
            })
    }

    const AddButton = () => (
        <TouchableHighlight onPress={() => {navigation.navigate('AddDayOff')}}>
            <View style={styles.addDayButtonOutside}>
                <Text>Dodaj dzień wolny</Text>
            </View>
        </TouchableHighlight>
    );    
    
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
                        ListFooterComponent={<AddButton/>}
                        ListFooterComponentStyle={styles.addDayButton}
                        contentContainerStyle={styles.flatListStyle}
                        ListEmptyComponent={<EmptyList message="Brak wpisanych dni wolnych!" />}
                    />
            </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    singleElement:{
        flex: 1,
        marginTop: 10,
        padding: 10,
        backgroundColor: "#DCDCDC",
        justifyContent: "space-between",
        flexDirection: "row",
    },
    textContainer: {
        flex: 8,
        flexDirection: "column",
        alignItems: "center",
    },
    hotelName:{
        flex: 1,
        alignContent: "center",
        flexWrap: "wrap",
        flexDirection: "row"
    },
    deleteButton: {
        flex:1
    },
    flatListStyle: {
        flexGrow: 1,
    },
    addDayButton: {
        flex:1, 
        justifyContent: 'flex-end'
    },
    addDayButtonOutside: {
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
        height: 40,
        marginTop: 10,
        marginBottom: 10,
    }
});

export default DaysOffScreen;