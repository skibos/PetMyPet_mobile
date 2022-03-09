import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableWithoutFeedback, FlatList, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getReservations from '../services/getReservations';
import deleteReservation from '../services/deleteReservation';

const ReservationListScreen = ({ navigation, route }) => {
    const [reservations, setReservations] = useState([])

    
    useEffect(() => {
        getReservations().then(data => setReservations(data));
    }, []);

    useEffect(() => {
        if (route.params?.saveReservation) { /* if added reservation */
            let newObj = {};
            newObj.hotel = {};
            newObj.animal = {};
            newObj["id"] = route.params?.saveReservation.dataFromPost.id
            newObj.hotel["name"] = route.params?.saveReservation.hotelName
            newObj.animal["name"] = route.params?.saveReservation.petName
            newObj["checkIn"] = route.params?.saveReservation.dataFromPost.checkIn
            newObj["checkOut"] = route.params?.saveReservation.dataFromPost.checkOut
            setReservations(previousState => [newObj, ...previousState])
        }
    }, [route.params?.saveReservation]);

    const SingleReservation = ({ item }) => {
        return (
            <View style={styles.singleElement}>
                <View style={styles.informationContainer}>
                    <View style={styles.information}>
                        <Text>{item.checkIn} - {item.checkOut}</Text>
                        <Text style={{ color: "black" }}>{item.hotel.name}</Text>
                        <Text style={{ color: "black" }}>{item.animal.name}</Text>
                    </View>
                </View>
                <View style={styles.statusContainerWaiting}>
                    <View style={styles.status}>
                        <Text>Oczekująca</Text>
                    </View>
                    <View style={styles.icon}>
                        <Icon name="close-box" size={40} color="yellow" onPress={() => {
                            deleteReservation(item.id)
                            setReservations(reservations.filter(({id}) => id != item.id));
                        }}/>
                    </View>
                </View>
            </View>
        )
    };

    const HistoryButton = () => (
        <TouchableWithoutFeedback onPress={() => {navigation.navigate('ReservationHistory')}}>
            <View style={styles.historyButtonOutside}>
                <Text>Historia rezerwacji</Text>
            </View>
        </TouchableWithoutFeedback>
      );    

    const renderReservation = ({ item }) => (
        <SingleReservation
            item={item}
        />
    );

    return (

        <View style={styles.screen}>
            <FlatList
                data={reservations}
                renderItem={renderReservation}
                keyExtractor={(item) => item.id}
                ListFooterComponent={<HistoryButton/>}
                ListFooterComponentStyle={styles.historyButton}
                contentContainerStyle={styles.flatListStyle}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    singleElement: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#DCDCDC",
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
    },
    informationContainer: {
        flex: 3,
    },
    information: {
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    statusContainerWaiting: {
        flex: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    status: {
        justifyContent: "center",
        alignItems: "center",
        height: 30,
        overflow: 'hidden',
        borderRadius: 10,
        backgroundColor: "yellow",
        flex: 3,
    },
    icon: {
        flex:1,
    },
    historyButton: {
        flex:1, 
        justifyContent: 'flex-end'
    },
    historyButtonOutside: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
        height: 40,
        marginTop: 10,
        marginBottom: 10,
    },
    flatListStyle: {
        flexGrow: 1,
    },
});

export default ReservationListScreen;