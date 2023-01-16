import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, ImageBackground, FlatList, TouchableWithoutFeedback, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import deleteFavourite from '../services/deleteFavourite';
import getFavourites from '../services/getFavourites';
import { SliderBox } from "react-native-image-slider-box";
import getImage from '../services/getImage';
import axiosInstance from '../services/axiosInstanceConfig';
import EmptyList from '../components/EmptyList';


const FavouriteHotelsScreen = ({ route, navigation }) => {
    const [hotels, setHotels] = useState([])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getFavourites().then(data => {
                if(data !== null && data !== undefined){
                    data.forEach(async(hotel) => {
                        hotel.image = [];
                        var arr = []
                        var id = hotel.id
                        arr = await getImage(id);
                        arr = arr.map(el => axiosInstance.defaults.baseURL + "/images/getResizedImageByPath/" + el + "/?width=200&height=200");
                        
                        if(arr.length > 0){
                            hotel.images = arr;
                        }
                        else{
                            arr[0] = require('../assets/brakZdj.png');
                            hotel.images = arr;
                        }
                        if(!hotels.some(el => el.id == hotel.id)){
                            setHotels(prevState => [...prevState, hotel]);
                        }
                    })
                }
                else{
                    setHotels([]);
                }
            })
        });

        return unsubscribe;
      }, [navigation, hotels]);

    const SingleHotel = React.memo(({ item, navigation }) => (
        <TouchableWithoutFeedback onPress={() => navigation.navigate("HotelDetailsFromFavourite", {
            id: item.id,
            isLogged: route.params?.isLogged
        })}>
            <View style={styles.singleHotelContainer}>
                <View style={styles.imageContainer}>
                    <SliderBox images={item.images ?? []}
                      ImageComponent={ImageBackground}
                      ImageComponentStyle={{ width: '90%', marginTop: 10,}}
                      imageStyle={{borderRadius: 4}}
                      resizeMode={"stretch"}
                    >
                        <View style={styles.heartIcon}>
                            <TouchableOpacity onPress={() => {
                                setHotels(hotels.filter(el => el.id != item.id))
                                deleteFavourite(item.id)
                            }}>
                                <Image source={require('../assets/paw-fav.png')} style={{height: 40, width: 40}}/>
                            </TouchableOpacity>
                        </View>
                    </SliderBox>
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.upperPartOfInfo}>
                        <View style={styles.nameOfHotel}>
                            <Text style={styles.nameOfHotelText}>{item.name}</Text>
                        </View>
                        <View style={styles.ratingOfHotel}>
                            <Icon name="star" size={20} color="#ffbc01"/>
                            <Text style={styles.regularFontFamily}>{item.hotelScores.score ? item.hotelScores.score : 0}</Text>
                            <Text style={styles.regularFontFamily}>({item.hotelScores.reviewsAmount ? item.hotelScores.reviewsAmount : 0})</Text>
                        </View>
                    </View>
                    <View style={styles.lowerPartOfInfo}>
                        <Text style={styles.regularFontFamily}>{item.city}</Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    ));

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
                ListEmptyComponent={<EmptyList message="Nie masz ulubionych hoteli!"/>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "white"
    },
    singleHotelContainer:{
        flex:1,
        height: 300,
        backgroundColor: "#f5f5f5",
        marginVertical: 10,
        flexDirection: "column",
        borderRadius: 12,
    },
    imageContainer:{
        flex:3,
    },
    heartIcon:{
        flex:1,
        padding: 10,
        alignItems: "flex-end"
    },
    infoContainer:{
        flex:1,
        flexDirection: "column",
        paddingHorizontal: 10,
    },
    upperPartOfInfo:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,  
    },
    lowerPartOfInfo:{
        flex: 1,
        paddingHorizontal: 10,  
    },
    nameOfHotel:{
        flex: 5,
        flexWrap:"wrap"
    },
    nameOfHotelText:{
        color: "black",
        fontSize: 16,
        fontFamily: "OpenSans_700Bold"
    },
    regularFontFamily:{
        color: "black",
        fontFamily: "OpenSans_400Regular",
    },
    ratingOfHotel:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center"        
    },

});

export default FavouriteHotelsScreen;