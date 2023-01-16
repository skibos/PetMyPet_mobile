import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableWithoutFeedback, SafeAreaView, Image, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFontAwesome from 'react-native-vector-icons/Ionicons';
import getHotels from '../services/getHotels';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { SliderBox } from "react-native-image-slider-box";
import getImage from "../services/getImage";
import axiosInstance from '../services/axiosInstanceConfig';
import FastImage from 'react-native-fast-image'
import { useTheme } from '@react-navigation/native';
import getFilteredHotels from '../services/getFilteredHotels';
import EmptyList from '../components/EmptyList';

const HotelListScreen = ({ route, navigation }) => {
    const [hotels, setHotels] = useState([])
    const [page, setpage] = useState(1);
    const [hasMore, sethasMore] = useState(true);
    const { colors } = useTheme();

    /* -- do usuniecia --  */
    // const [images, setImages] = useState([
    //     require('../assets/hotel.jpg'),  
    //     require('../assets/loginbackground.jpg'),  
    // ]);

    // useEffect(() => {
    //     getHotels(page).then(all => setHotels(all))
    //     setpage(page + 1);
    // }, []);

    // const fetchData = async () => { /* called after reach end, get next 12 hotels if it is possible */
    //     if(hasMore){
    //         let newHotels = await getHotels(page);
    //         if (newHotels.length === 0) {
    //             sethasMore(false);
    //         }
    //         else{
    //             setHotels([...hotels, ...newHotels]);
    //             setpage(page + 1);
    //         }
    //     }
    // };
    /* -- do usuniecia --  */
    //const changeIsLoading = () => setIsLoading(false);

    useEffect(() => {
        
        var isMounted = true;
        console.log(route)
        if(route.params.location != "" || route.params.km != "" || route.params.dateFrom != "" || route.params.dateTo != "" || route.params.typeOfPet != ""){
            getFilteredHotels(
                route.params.location,
                route.params.km,
                route.params.dateFrom,
                route.params.dateTo,
                route.params.typeOfPet,
                page
            ).then(all => {
                console.log(all)
                if(isMounted ){
                    if(all != undefined){
                        all.forEach(async(hotel) => {
                            hotel.image = [];
                            var arr = []
                            arr = await getImage(hotel.id);
                            arr = arr.map(el => axiosInstance.defaults.baseURL + "/images/getResizedImageByPath/" + el + "/?width=200&height=200");
                        
                            if(arr.length > 0){
                                hotel.images = arr;
                            }
                            else{
                                arr[0] = require('../assets/brakZdj.png');
                                hotel.images = arr;
                            }
                            setHotels(prevState => [...prevState, hotel]);
                        })
                        setpage(page + 1);
                    }       
                }         
            })
        }
        else{
            getHotels(page).then(all => {
                if(isMounted ){
                    all.forEach(async(hotel) => {
                        hotel.images = [];
                        var arr = []
                        arr = await getImage(hotel.id);
                        arr = arr.map(el => axiosInstance.defaults.baseURL + "/images/getResizedImageByPath/" + el + "/?width=200&height=200");
                        
                        if(arr.length > 0){
                            hotel.images = arr;
                        }
                        else{
                            arr[0] = require('../assets/brakZdj.png');
                            hotel.images = arr;
                        }

                        setHotels(prevState => [...prevState, hotel]);
                    })
                    setpage(page + 1);
                }
            })    
        }

        
        return () => { isMounted = false };
        
    }, []);

    const fetchData = async () => { /* called after reach end, get next 12 hotels if it is possible */
        if(hasMore){
            var newHotels;
            if(route.params.location != "" || route.params.km != "" || route.params.dateFrom != "" || route.params.dateTo != "" || route.params.typeOfPet != ""){
                newHotels = await getFilteredHotels(
                    route.params.location, 
                    route.params.km, 
                    route.params.dateFrom, 
                    route.params.dateTo, 
                    route.params.typeOfPet, 
                    page
                );            
            }
            else{
                newHotels = await getHotels(page);
            }

            if (newHotels.length == 0) {
                sethasMore(false);
            }
            else{
                newHotels.forEach(async(hotel) => {
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
                })
                setHotels([...hotels, ...newHotels]);
                setpage(page + 1);
            }
        }
    };

    const SingleHotel = React.memo(({ item, navigation }) => {

        return(
        <TouchableWithoutFeedback onPress={() => {
            if(route.params?.isLogged){
                navigation.navigate("HotelDetailsLogged", {
                    id: item.id,
                    isLogged: route.params?.isLogged
                })
            }
            else{
                navigation.navigate("HotelDetailsLoggedOut", {
                    id: item.id,
                    isLogged: route.params?.isLogged
                })
            }

        }}>
            <View style={styles.singleHotelContainer}>
                <View style={styles.imageContainer}>
                {/* <SliderBox images={images} */}
                    <SliderBox images={item.images ?? []}
                        ImageComponent={Image}
                        ImageComponentStyle={{ width: '90%', marginTop: 10, borderRadius: 12}}
                        resizeMode={"stretch"}
                    /> 
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.upperPartOfInfo}>
                        <View style={styles.nameOfHotel}>
                            <Text style={styles.nameOfHotelText}>{item.name}</Text>
                        </View>
                        <View style={styles.ratingOfHotel}>
                            <IconFontAwesome name={item.hotelScores.score == 0 || item.hotelScores.score === null || item.hotelScores.score === undefined ? "star-outline" : "star"}  size={20} color="#ffbc01"/>
                            <Text style={styles.regularFontFamily}>  {item.hotelScores.score ? Number(item.hotelScores.score.toFixed(2)) : 0}  </Text>
                            <Text style={styles.regularFontFamily}>({item.hotelScores.reviewsAmount ? item.hotelScores.reviewsAmount : 0})</Text>
                        </View>
                    </View>
                    <View style={styles.lowerPartOfInfo}>
                        <Text style={styles.regularFontFamily}>{item.city}</Text>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    
    )});

    const renderHotel = ({ item }) => {

        return(
            <SingleHotel
            item={item}
            navigation={navigation}
            />
    );}

    return (
            <View style={styles.screen} key={route.params?.isLogged}>
                <FlatList
                    removeClippedSubviews 
                    maxToRenderPerBatch={5}
                    updateCellsBatchingPeriod={25}
                    windowSize={8}
                    getItemLayout={(data, index) => (
                        {length: 300, offset: 300 * index, index}
                    )}
                    data={hotels}
                    initialNumToRender={12}
                    renderItem={renderHotel}
                    keyExtractor={(item) => item.id}
                    onEndReachedThreshold = {0.2}
                    onEndReached = {fetchData}
                    ListEmptyComponent={<EmptyList message="Brak hoteli!"/>}
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
    loadingIndicator:{
        flex:1,
        justifyContent: "center",
        alignItems: "center"        
    },
});

export default HotelListScreen;