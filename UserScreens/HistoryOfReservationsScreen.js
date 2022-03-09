import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableWithoutFeedback, FlatList, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getReservationsHistory from '../services/getReservationsHistory';

const getStyleStatus = (status) => {
    switch (status) {
        case "A":
            return (
                {
                    backgroundColor: "green",
                }
            );
        case "R":
            return (
                {
                    backgroundColor: "red",
                }
            );
    }
}

const statusText = (status) => {
    switch (status) {
        case "A":
            return (

                <Text>Akceptowano</Text>

            );
        case "R":
            return (
                <Text>Odrzucona</Text>
            );
    }
}

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
            <View style={styles.statusContainer}>
                <View style={[styles.status, getStyleStatus(item.status)]}>
                    {statusText(item.status)}
                </View>
            </View>
        </View>
    )
};


const HistoryOfReservationsScreen = ({ navigation }) => {
    const [reservationsHistory, setReservationsHistory] = useState([])

    useEffect(() => {
        getReservationsHistory().then(data => setReservationsHistory(data));
    }, []);

    const renderReservation = ({ item }) => (
        <SingleReservation
            item={item}
        />
    );

    return (

        <View style={styles.screen}>
            <FlatList
                data={reservationsHistory}
                renderItem={renderReservation}
                keyExtractor={(item) => item.id}
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
    statusContainer: {
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
        flex: 1,
    },
});

export default HistoryOfReservationsScreen;