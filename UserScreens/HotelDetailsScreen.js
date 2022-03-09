import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableWithoutFeedback, ScrollView, Dimensions, TouchableWithoutFeedbackBase, FlatList, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import {Calendar} from 'react-native-calendars';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import RNPickerSelect from 'react-native-picker-select';
import getSecureData from '../storage/getSecureData';
import getHotelDetails from '../services/getHotelDetails';
import getAnimalTypes from '../storage/getAnimalTypes';
import getDayOffByHotel from '../services/getDayOffByHotel';
import getDatesBetween from '../services/getDatesBetween';
import {Linking} from 'react-native'

const Pin = {
    latitude: 53.49188,
    longitude: 18.74975,
};

const HotelDetailsScreen = ({ route, navigation }) => {

    const { id } = route.params;
    const [allTypesAnimals, setAllTypesAnimals] = useState(); // all types from async storage
    const [priceList, setPriceList] = useState ([]); // converted pricelist
    const [descriptionMore, setDescriptionMore] = useState(false);
    const [typeOfPet, setTypeOfPet] = useState(); // selected type from picker
    const [listTypeOfPets, setListTypeOfPets] = useState ([]); // converted listOfPets to picker
    const [isSelectType, setIsSelectType] = useState(false); // if type is selected show calendar
    const [isUser, setIsUser] = useState(true); // check authority, button booking visible depend on authority
    const [closedDays, setClosedDays] = useState({});
    const [phoneNumberMore, setPhoneNumberMore] = useState(false);

    const [data, setData] = useState({ // data from api about hotel
        city: "",
        contactEmail: "",
        description: "",
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

        Promise.all([getAnimalTypes(),getHotelDetails(id)]).then( res => {

            setAllTypesAnimals(res[0]) // fill data
            setData(res[1])
            console.log(res[1])
            if(priceList.length === 0 && listTypeOfPets.length === 0){ // fill pricelist and picker
                let singleType;
                let arrayForPrice = [];
                let arrayForListTypes = [];
                Object.entries(res[1].prices).forEach(entry => {
                    const [key, value] = entry;
                    singleType = {
                        id: key,
                        type: res[0][key],
                        price: value
                    }
                    arrayForPrice.push(singleType);
                    singleType = {
                        label: res[0][key].charAt(0).toUpperCase() + res[0][key].slice(1),
                        value: key
                    }
                    arrayForListTypes.push(singleType)
                })
                setPriceList(arrayForPrice);
                setListTypeOfPets(arrayForListTypes);
            }
            
        })

        getSecureData().then(res => { /* dont show booking screen when owner */
            if(res.authority == 'ROLE_USER'){
                setIsUser(true);
            }
            else if(res.authority == 'ROLE_OWNER'){
                setIsUser(false);
            }
        })

    }, [])


    useEffect(async() => {
        let newDates = JSON.parse(JSON.stringify(closedDays)) // get reference (markedDates param is immutable)
        newDates = {} // clear marked dates

        getDayOffByHotel(id).then(response => {

            if(response != null){

                let closedDaysByType = response.filter(el => el.animalType == typeOfPet)

                let arrayOfDates = new Array();
                let today = new Date();
                today.setHours(0,0,0,0);

                closedDaysByType.forEach(el => {
                    if(new Date(el.endingDate) >= today && new Date(el.startingDate) >= today){
                        arrayOfDates = [...arrayOfDates, ...getDatesBetween(new Date(el.startingDate), new Date(el.endingDate))]
                    }
                    else if(new Date(el.endingDate) >= today && new Date(el.startingDate) < today){
                        arrayOfDates = [...arrayOfDates, ...getDatesBetween(today, new Date(el.endingDate))]
                    }
                })

                for(const day of arrayOfDates){
                    newDates[day] = { color: 'red', textColor: 'black'}
                }
                
                setClosedDays(newDates)
            }
        })

    }, [typeOfPet])

    return (
    <SafeAreaView style={styles.screen}>
    <View style={styles.screen}>
        <ScrollView>
            <View style={styles.containerForAll}>
                <View style={styles.photo}>
                    <Text>{/* photo */}</Text>
                </View>
                <View style={styles.hotelInfoContainer}>
                    <View style={styles.name}>
                        <Text style={styles.nameText}>{data.name}</Text>
                    </View>
                    <View style={styles.addressAndRatingContainer}>
                        <View style={styles.address}>
                            <Text>{data.city}, </Text>
                            <Text>{data.street}</Text>
                            <Text>{data.zipcode}</Text>
                        </View>
                        <View style={styles.rating}>
                            <Text style={styles.ratingText}>{data.hotelScores.score ? data.hotelScores.score : 0}</Text>
                            <Icon name="star-half-full" size={25} color="green"/>
                        </View>
                    </View>    
                </View>
                <View style={styles.descripton}>
                    <View style={styles.descriptonHeader}>
                        <Text style={styles.descriptonHeaderText}>Opis</Text>
                    </View>
                    <View style={styles.descriptonContent}>
                        {descriptionMore ? (<Text>{data.description}</Text>) : (
                        <Text>
                            <Text>{data.description.substring(0, 100)}</Text>
                            <Text onPress={() => {setDescriptionMore(true)}} style={{color:"green"}} >...Pokaż więcej</Text>
                        </Text>
                        )}
                    </View>
                </View>
                <View style={styles.pricelist}>
                    <View style={styles.pricelistHeaderContainer}>
                        <View style={styles.pricelistHeader}>
                            <Text>Cennik</Text>
                        </View>
                        <View style={styles.pricelistHeaderOfTable}>
                            <View style={styles.column}>
                                <Text>Typ zwierzęcia</Text>
                            </View>
                            <View style={styles.column}>
                                <Text>Cena</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.contentOfPricelist}>
                    {/* nie mozna uzyc flatlisty w scrollview wiec to jedyna opcja */}
                        {priceList.map((price) => (
                            <View key={price.id} style={styles.singleRowInPricelist}>
                                <View style={styles.column}>
                                    <Text>{price.type}</Text>
                                </View>
                                <View style={styles.column}>
                                    <Text>{price.price}</Text>
                                </View>
                            </View>
                        ))}
                    </View>    
                </View>
                <View style={styles.checkTermAndReservContainer}>
                    <View style={styles.headerOfCheckTerm}>
                        <Text>Sprawdź terminy i zarezerwuj:</Text>
                    </View>
                    <View style={styles.textAndButtonContainer}>
                        <View style={styles.buttonAddPets}>
                            <RNPickerSelect
                                onValueChange={(value) => {
                                    setTypeOfPet(value)
                                    if(value != null){
                                        setIsSelectType(true)
                                    }
                                    else{
                                        setIsSelectType(false)
                                    }
                                }}
                                items={listTypeOfPets}
                                useNativeAndroidPickerStyle={false}
                                style={{
                                    ...pickerSelectStyles,
                                    iconContainer: {
                                    top: 10,
                                    right: 10,
                                    },
                                }}
                                placeholder={{
                                    label: 'Wybierz typ zwierzecia',
                                    value: null,
                                }}
                                Icon={() => {
                                    return <Icon name="arrow-down" size={24} />;
                                }}
                                value={typeOfPet}
                            />
                        </View>
                        <View style={styles.price}>
                            <Text>Cena:</Text>
                            <Text>{isSelectType ? data.prices[typeOfPet] : 0}</Text>
                        </View>
                    </View>
                    {isSelectType &&
                    <View>
                        <View style={styles.calendarContainer}>
                            <View style={styles.calendarHeader}> 
                                <Text>Zajęte terminy</Text>
                            </View>
                                <Calendar
                                hideExtraDays={true}
                                firstDay={1}
                                markingType={'period'}
                                markedDates={closedDays}
                                style={{borderRadius: 20, overflow: "hidden"}}
                                />
                        </View>                                        
                        <View style={styles.reservationButtonContainer}>
                            { isUser &&
                            <TouchableWithoutFeedback onPress={() => {navigation.navigate("Booking", {
                                id: id,
                                name: data.name,
                                priceList: data.prices
                            })}}>
                                <View style={styles.reservationButton}>
                                    <Text>Złóż rezerwacje</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            }
                        </View>
                    </View>
                    }
                </View>
                
                <View>
                    <MapView
                            style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            initialRegion={{
                                latitude: 53.48371,
                                longitude: 18.75352,
                                latitudeDelta: 0.0922, 
                                longitudeDelta: (0.0922 + (Dimensions.get("window").width / 120)),
                              }}
                    >
                            <Marker coordinate={ Pin }/>
                    </MapView>
                </View>
            </View>
        </ScrollView>

        <View style={styles.footer}>
            <TouchableWithoutFeedback onPress={() => {
                Linking.openURL(`tel:${data.phoneNumber}`)
            }}>
                <View style={styles.callButton}>
                    <Text>Zadzwoń</Text>
                </View>
            </TouchableWithoutFeedback>
        </View>
    </View>
    </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex:1,
    },
    containerForAll: {
        flexDirection: "column",
        marginVertical: 10,
        flex: 1,
    },
    photo: {
        backgroundColor: "lightgrey",
        height: 150,
    },
    hotelInfoContainer: {
        backgroundColor: "white",
        padding: 10,
    },
    name: {
        alignItems: "center",
    },
    nameText: {
        fontSize: 20,
        fontWeight: "bold",
    },
    addressAndRatingContainer:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    address:{
        flex: 1,
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
        paddingHorizontal: 10,
    },
    descripton: {
        backgroundColor: "lightgrey",
        padding: 10,
        marginBottom: 10,
    },
    descriptonHeader: {
        marginBottom: 10,
    },
    descriptonHeaderText:{
        fontSize: 16,
    },
    pricelist: {
        flex:1,
        flexDirection: "column",
        backgroundColor: "lightgrey",
        marginBottom: 10,
    },
    pricelistHeaderContainer: {
        flexDirection: "column"
    },
    pricelistHeader: {
        flex:1,
        padding: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    pricelistHeaderOfTable: {
        backgroundColor: "grey",
        flexDirection: "row",
    },
    column:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
    },
    contentOfPricelist:{
        flexDirection: "column",
    },
    singleRowInPricelist:{
        flexDirection: "row"
    },
    checkTermAndReservContainer:{
        backgroundColor: "lightgrey",
        padding: 10,
        marginBottom: 10,
        flexDirection: "column"
    },
    headerOfCheckTerm:{
        flex: 1,
        alignItems:"center",
    },
    textAndButtonContainer: {
        flex: 2,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: "5%",
        paddingVertical: 10,
    },
    buttonAddPets: {
        flex: 2,
    },
    price: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    reservationButtonContainer: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    reservationButton: {
        backgroundColor: "red",
        padding: 10,
        width: "90%",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderRadius: 12,
    },
    calendarContainer: {
        marginBottom: 10,
        flexDirection: "column",
    },
    calendarHeader: {
        padding: 10,
        backgroundColor: "lightgrey",
        justifyContent: "center",
        alignItems: "center",
    },
    map: {
        height: 120,
        width: Dimensions.get('window').width,
    },
    footer: {
        height: 60,
        padding: 10,
    },
    callButton:{
        flex:1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "lightgreen",
        borderRadius: 12
    },
}); 

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'black',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
      backgroundColor: "#BC544B",
      width: "100%",
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'black',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
      backgroundColor: "#BC544B",
      width: "100%",
    },
  });
export default HotelDetailsScreen;