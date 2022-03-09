import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import deleteFavourite from '../services/deleteFavourite';
import getFavourites from '../services/getFavourites';

const FavouriteHotelsScreen = ({ route, navigation }) => {
    const [hotels, setHotels] = useState([])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getFavourites().then(data => setHotels(data))
        });

        return unsubscribe;
      }, [navigation]);

    const SingleHotel = ({ item, navigation }) => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate("HotelDetails", {
            id: item.id
        })}>
        <View style={styles.singleHotelContainer}>
            <View style={styles.imageContainer}>
                <Text style={{color: "black"}}>{item.photo}</Text>
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.upperPartOfInfo}>
                    <View style={styles.nameOfHotel}>
                        <Text style={{color: "black", flexShrink: 1}}>{item.name}</Text>
                    </View>
                    <View style={styles.ratingOfHotel}>
                        <Text>{item.hotelScores.score ? item.hotelScores.score : 0}</Text>
                    <Icon name="star" size={25} color="yellow"/>
                    </View>
                </View>
                <View style={styles.lowerPartOfInfo}>
                    <View style={styles.locationOfHotel}>
                        <Text style={{color: "black"}}>{item.city},</Text>
                        <Text style={{color: "black"}}>{item.street}</Text>
                    </View>
                    <View style={styles.heartIcon}>
                        <Icon name="heart" size={30} color="red" onPress={() => {
                            setHotels(hotels.filter(el => el.id != item.id))
                            deleteFavourite(item.id)
                        }}/>
                    </View>
                </View>
            </View>
        </View>
        </TouchableWithoutFeedback>
    
    );

    const renderHotel = ({ item }) => (
            <SingleHotel
            item={item}
            navigation={navigation}
            />
      );
  
    return (
        <View style={styles.screen}>
            <FlatList
                data={hotels}
                renderItem={renderHotel}
                keyExtractor={(item) => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    singleHotelContainer:{
        flex:1,
        height: 120,
        backgroundColor: "lightgrey",
        marginVertical: 5,
        flexDirection: "row"
    },
    imageContainer:{
        flex:1,
        backgroundColor: "green",
        height: 120
    },
    infoContainer:{
        flex:2,
        flexDirection: "column"
    },
    upperPartOfInfo:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        
    },
    lowerPartOfInfo:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    nameOfHotel:{
        flex: 4,
        padding: 10,
    },
    ratingOfHotel:{
        flex: 1,
        paddingHorizontal: 10,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center"        
    },
    locationOfHotel:{
        padding: 10,
        justifyContent:"flex-end",
    },
    heartIcon:{
        padding: 10,
        justifyContent: "flex-end",
    },
});

export default FavouriteHotelsScreen;