import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, Dimensions, ImageBackground, Image, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import {Calendar} from 'react-native-calendars';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import RNPickerSelect from 'react-native-picker-select';
import getSecureData from '../storage/getSecureData';
import getHotelDetails from '../services/getHotelDetails';
import getAnimalTypes from '../storage/getAnimalTypes';
import {Linking} from 'react-native'
import { SliderBox } from "react-native-image-slider-box";
import getFavourites from '../services/getFavourites';
import addFavourite from '../services/addFavourite'
import deleteFavourite from '../services/deleteFavourite'
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import getImage from "../services/getImage"
import axiosInstance from '../services/axiosInstanceConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


const HotelDetailsScreen = ({ route, navigation }) => {
    const { colors } = useTheme();

    const { id, isLogged } = route.params;
    const [priceList, setPriceList] = useState ([]); // converted pricelist
    const [isUser, setIsUser] = useState(); // check authority, button booking visible depend on authority
    const [images, setImages] = useState([]);
    const [fav, setFav] = useState([]); // array of favourites hotels 

    const [data, setData] = useState({ // data from api about hotel
        city: "",
        contactEmail: "",
        description: "",
        lat: 14.53223,
        lon: 53.43345,
        hotelScores: {
          reviewsAmount: "",
          score: "",
        },
        id: "",
        name: "",
        owner: "",
        phoneNumber: "",
        prices: {},
        street: "",
        zipcode: "",
    }); 

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {

            Promise.all([getAnimalTypes(),getHotelDetails(id)]).then( async(res) => {
            
                setData(res[1])
    
                var arr = []
                arr = await getImage(res[1].id);
                if(arr !== null && arr !== undefined){
                    arr = arr.map(el => axiosInstance.defaults.baseURL + "/images/getResizedImageByPath/" + el + "/?width=200&height=200");
                }
                if(arr.length == 0){
                    arr[0] = require('../assets/brakZdj.png');
                }
                setImages(arr);
    
    
                if(priceList.length === 0){ // fill pricelist
                    let singleType;
                    let arrayForPrice = [];
                    Object.entries(res[1].prices).forEach(entry => {
                        const [key, value] = entry;
                        singleType = {
                            id: key,
                            type: res[0][key],
                            price: value
                        }
                        arrayForPrice.push(singleType);
                    })
                    setPriceList(arrayForPrice);
                }
            })
    

        });

        return unsubscribe;

    }, [navigation, data, priceList])

    useFocusEffect( /* check if logged and get fav */
        React.useCallback(() => {
            if(route.params?.isLogged){
                getSecureData().then(res => { /* dont show booking screen when owner */
                    if(res.authority == 'ROLE_USER'){
                        setIsUser(true);

                        setFav([]);
                
                        getFavourites().then(favourites => {
                            if(favourites !== undefined){
                                favourites.forEach(el => {
                                        setFav(previousState => [el.id, ...previousState])
                                })
                            }
                        })

                    }
                    else if(res.authority == 'ROLE_OWNER'){
                        setIsUser(false);
                    }
                })
            }
        }, [navigation])
    );

    return (
    <SafeAreaView style={styles.screen}>
    <View style={styles.screen}>
        <ScrollView>
            <View style={styles.containerForAll}>
                <View style={styles.photo}>
                    <SliderBox images={images}
                      ImageComponent={ImageBackground}
                      ImageComponentStyle={{ width: '100%'}}
                      resizeMode={"stretch"}
                      sliderBoxHeight={300}
                    >
                        {route.params?.isLogged && isUser &&
                            <View style={styles.heartIcon}>
                                <TouchableOpacity onPress={() => {
                                    if(fav.includes(id)){ // is favourite and delete from favourite
                                        deleteFavourite(id)
                                        setFav(fav.filter(el => el != id))
                                    }
                                    else{ // add to favourite
                                        addFavourite(id)
                                        setFav([id, ...fav])
                                    }
                                }}>
                                    <Image source={fav.includes(id) ? require('../assets/paw-fav.png') : require('../assets/paw.png')} style={{height: 40, width: 40}}/> 
                                </TouchableOpacity>
                            </View>
                        }
                    </SliderBox>
                </View>
                <View style={styles.hotelInfoContainer}>
                    <View style={styles.name}>
                        <Text style={styles.nameText}>{data.name}</Text>
                    </View>
                    <View style={styles.addressAndRatingContainer}>
                        <View style={styles.address}>
                            <Text style={styles.regularFontFamily}>{data.zipcode}, {data.city}</Text>
                            <Text style={styles.regularFontFamily}>{data.street}</Text>
                        </View>
                        <View style={styles.rating}>
                            <Icon name={data.hotelScores.score == 0 || data.hotelScores.score == null  ? "star-outline" : "star"} size={25} color="#ffbc01"/>
                            <Text style={styles.ratingText}>{data.hotelScores.score ? data.hotelScores.score : 0}</Text>
                            <Text style={styles.regularFontFamily}>({data.hotelScores.reviewsAmount ? data.hotelScores.reviewsAmount : 0} ocen)</Text>
                        </View>
                    </View>    
                </View>
                <View style={styles.descripton}>
                    <View style={styles.descriptonHeader}>
                        <Text style={styles.descriptonHeaderText}>Opis</Text>
                    </View>
                    <View style={styles.descriptonContent}>
                        <Text style={styles.regularFontFamily}>{data.description}</Text>
                    </View>
                </View>
                <View style={styles.pricelist}>
                    <View style={styles.pricelistHeaderContainer}>
                        <View style={styles.pricelistHeader}>
                            <Text style={styles.pricelistHeaderText}>Cennik</Text>
                        </View>
                        <View style={styles.pricelistHeaderOfTable}>
                            <View style={styles.column}>
                                <Text style={styles.regularFontFamily}>typ</Text>
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.regularFontFamily}>cena</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.contentOfPricelist}>
                    {/* nie mozna uzyc flatlisty w scrollview wiec to jedyna opcja */}
                        {priceList.map((price) => (
                            <View key={price.id} style={styles.singleRowInPricelist}>
                                <View style={styles.column}>
                                    <Text style={styles.regularFontFamily}>{price.type}</Text>
                                </View>
                                <View style={styles.column}>
                                    <Text style={styles.regularFontFamily}>{price.price} zł</Text>
                                </View>
                            </View>
                        ))}
                    </View>    
                </View>
                <View style={styles.mapContainer}>
                    <View style={styles.mapHeader}>
                        <Text style={styles.mapHeaderText}>Dojazd</Text>
                    </View>
                    {/* <MapView
                            style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            region={{
                                latitude: data.lat,
                                longitude: data.lon,
                                latitudeDelta: 0.001, 
                                longitudeDelta: 0,
                              }}
                    >                    
                            <Marker coordinate={{latitude: data.lat, longitude: data.lon}}/>
                    </MapView> */}
                </View>
            </View>
        </ScrollView>
        { isUser || !isLogged ?
        <View style={styles.footer}>
            <View style={styles.contactContainer}>
                <View style={styles.callButtonContainer}>
                    <TouchableOpacity onPress={() => {
                        Linking.openURL(`tel:${data.phoneNumber}`)
                    }}>
                        <View style={styles.callButton}> 
                            <Icon name="call-outline" size={25} color="black"/>
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => {
                    Linking.openURL(`mailto:${data.contactEmail}`)
                }}>
                    <View style={styles.callButton}> 
                        <Icon name="mail-outline" size={25} color="black"/>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.bookingButtonContainer}>
                <TouchableOpacity onPress={() => {
                    if(isLogged){
                        navigation.navigate("Booking", {
                            id: id,
                            name: data.name,
                            priceList: data.prices
                        })
                    }
                    else{
                        Alert.alert(
                            '',
                            'Możliwość zarezerwowania obiektu dostępna jest jedynie po zalogowaniu się do aplikacji.',
                            [
                                { text: "Zamknij", style: "cancel" },
                                { text: "Zaloguj się", onPress: () => navigation.navigate('Login') },
                            ]
                            
                        )
                    }
                }}>
                    <View style={[styles.bookingButton, {backgroundColor: colors.primary}]}>
                        <Text style={styles.bookingButtonText}>Zarezerwuj</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View> :
        <View style={styles.footer}>
            <View style={styles.editButtonContainer}>
                <TouchableOpacity onPress={async() => {
                        try {    
                            await AsyncStorage.setItem('editHotelId', id.toString())
                            navigation.navigate('EditHotelTab', {params:{id: id}, screen: 'EditHotel'})      
                        } 
                        catch (e) {    // saving error
                            console.log(e)
                        }    
                    }}>
                    <View style={[styles.bookingButton, {backgroundColor: colors.primary}]}>
                        <Text style={styles.bookingButtonText}>Edytuj hotel</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    }
    </View>
    </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex:1,
        backgroundColor: "white",
    },
    containerForAll: {
        flexDirection: "column",
        marginVertical: 10,
        flex: 1,
    },
    photo: {
        height: 300,
    },
    hotelInfoContainer: {
        margin: 10,
        borderBottomColor: 'lightgrey',
        borderBottomWidth: 1,
    },
    name: {
        alignItems: "center",
        padding: 10,
    },
    nameText: {
        fontSize: 20,
        fontFamily: 'OpenSans_700Bold'
    },
    addressAndRatingContainer:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
    },
    address:{
        flex: 3,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start"
    },
    rating:{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    ratingText: {
        paddingHorizontal: 5,
        fontFamily: 'OpenSans_600SemiBold',
        textDecorationLine: "underline"
    },

    descripton: {
        paddingHorizontal:10,
        paddingBottom: 10,
        marginHorizontal: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
    },
    descriptonHeader: {
        marginBottom: 10,
    },
    descriptonHeaderText:{
        fontSize: 18,
        fontFamily: 'OpenSans_600SemiBold'
    },
    pricelist: {
        flex:1,
        flexDirection: "column",
        marginHorizontal: 10,
        paddingHorizontal:10,
        marginBottom: 10,
        paddingBottom:10,
        borderBottomWidth: 1,
        borderBottomColor: 'lightgrey',
    },
    pricelistHeaderContainer: {
        flexDirection: "column"
    },
    pricelistHeader: {
        flex:1,
        justifyContent: "flex-start",
        alignItems: "flex-start"
    },
    pricelistHeaderText:{
        fontSize: 18,
        fontFamily: 'OpenSans_600SemiBold'
    },
    pricelistHeaderOfTable: {
        flexDirection: "row",
    },
    column:{
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        paddingVertical: 10,
    },
    contentOfPricelist:{
        flexDirection: "column",
    },
    singleRowInPricelist:{
        flexDirection: "row"
    },
    map: {
        height: 300,
    },
    mapContainer:{
        paddingHorizontal: 10,
        flexDirection: "column",
    },
    mapHeader:{
        padding: 10,
        justifyContent: "flex-start",
        alignItems:"flex-start"
    },
    mapHeaderText:{
        fontSize: 18,
        fontFamily: 'OpenSans_600SemiBold'
    },
    footer: {
        height: 60,
        padding: 10,
        flexDirection:"row",
        justifyContent:"space-between",
        backgroundColor:"#F9F9F9"
    },
    callButton:{
        backgroundColor: "#FFEFBE",
        justifyContent: "center",
        alignItems: "center",
        height:40,
        paddingHorizontal:20,
        borderRadius: 30,
    },
    callButtonContainer:{
        paddingHorizontal: 10,
    },
    contactContainer:{
        justifyContent:"flex-start",
        flexDirection: "row"
    },
    bookingButton:{
        backgroundColor: "yellow",
        justifyContent: "center",
        alignItems: "center",
        height:40,
        borderRadius: 16,
        paddingHorizontal:40,
    },
    bookingButtonText:{
        fontFamily: "OpenSans_600SemiBold"
    },
    bookingButtonContainer:{
        justifyContent:"flex-end"
    },
    editButtonContainer:{
        flex:1,
        justifyContent: "center",
        alignItems: "stretch",
    },
    heartIcon:{
        flex:1,
        padding: 10,
        alignItems: "flex-end"
    },
    regularFontFamily:{
        color: "black",
        fontFamily: "OpenSans_400Regular",
    },
}); 

export default HotelDetailsScreen;