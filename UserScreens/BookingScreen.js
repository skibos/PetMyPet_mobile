import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, TouchableWithoutFeedback, TouchableOpacity, Platform, Modal, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNPickerSelect from 'react-native-picker-select';
import {Calendar} from 'react-native-calendars';
import getUserPets from '../services/getUserPets';
import getDayOffByHotel from '../services/getDayOffByHotel';
import getDatesBetween from '../services/getDatesBetween';
import * as Yup from "yup";
import { Formik } from "formik";
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../services/axiosInstanceConfig';
import getUserAccountDetails from '../services/getUserAccountDetails';
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';

const BookingScreen = ({ route, navigation }) => {
    const { colors } = useTheme();
    const { id, name, priceList } = route.params; /* hotel id */
    const [userPets, setUserPets] = useState([]); /* list to picker */
    const [animal, setAnimal] = useState(''); /* picked pet -> id is value, for useEffect */
    const [closedDaysStart, setclosedDaysStart] = useState({}); /* marked days after pick starting date */
    const [closedDaysEnd, setclosedDaysEnd] = useState({}); /* marked days after pick ending date */
    const [dateFrom, setDateFrom] = useState(); /* picked startingDate, for useEffect */
    const [dateTo, setDateTo] = useState(); /* picked endingDate, for useEffect */
    const [startMonthCounter, setStartMonthCounter] = useState(0); // if 0 its current month, if 0 you cant subtract month in calendar
    const [endMonthCounterLeft, setEndMonthCounterLeft] = useState(0); // if 0 its current month, if 0 you cant subtract month in calendar
    const [endMonthCounterRight, setEndMonthCounterRight] = useState(); /* block arrow in calendar - future months */
    const [closedDayInNextMonth, setClosedDayInNextMonth] = useState(false); /* block arrow in calendar - future months */
    const [startingDateVisible, setStartingDateVisible] = useState(false);
    const [endingDateVisible, setEndingDateVisible] = useState(false);
    const [finalPrice, setFinalPrice] = useState(0);
    const [userDataFilled, setUserDataFilled] = useState(true);

    const [showDate, setShowDate] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const showDatepicker = (arg) => {
        setShowDate(arg);
    };

    useEffect(() => {
        getUserAnimals(); /* get user animals */
    },  [])

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setUserDataFilled(true);
            getUserAccountDetails().then((res) => { /* check if user fill profil data */
                for(const value in res){
                    if(!res[value]){
                        setUserDataFilled(false);
                        break;
                    }
                }
            })
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
      }, [navigation]);

    function getUserAnimals(){ // get user pets and convert to picker format, 
        getUserPets().then(res => {
            if(res){
                let animals = [];
                let singleAnimal = {};
                res.forEach(obj => { // array of objects foreach
                    if(obj.animalType in priceList){ // if hotel have type in pricelist
                        singleAnimal = {
                            label  : obj.name.charAt(0).toUpperCase() + obj.name.slice(1), // first letter upperCase - np. Puszek
                            value  : obj.id, // np. 1
                            type : obj.animalType // np. 1
                        }
                        animals.push(singleAnimal);
                    }
                })
                if(animals.length === 0){
                    Alert.alert(
                        'Uzupełnij profil!',
                        'Nie masz w profilu takich typów zwierząt które obsługuje ten hotel! Kliknij ok aby dodać nowe zwierzę!',
                        [
                            { text: "Zamknij", style: "cancel", onPress: () => navigation.goBack()},
                            { text: "OK", onPress: () => {
                                navigation.goBack();
                                navigation.navigate('AccountUserTab', { screen: 'ListOfPetsTab', initial: false, params: { screen: 'AddPet', initial: false}});
                            }},
                        ]
                    )
                }
                else{
                    setUserPets(animals);
                }
            }
        })
    }

    function monthDiff(d1, d2) {
        var months;
        months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth();
        months += d2.getMonth();
        return months <= 0 ? 0 : months;
    }

    useEffect(() => { // after pick pet, set closed days to pickers
        let newDates = JSON.parse(JSON.stringify(closedDaysStart)) // get reference (markedDates param is immutable)
        newDates = {} // clear marked dates

        let closedDates = new Array();
        let datesBeforeToday = new Array();
        let today = new Date();
        today.setHours(0,0,0,0); // today
        let firstDay = new Date(today.getFullYear(), today.getMonth(), 1); // first day of month

        getDayOffByHotel(id).then(response => { /* get closed dates in starting date calendar from today */

            if(response != null){
                if(userPets.some(el => el.value == animal)){
                    let type = userPets.find(el => el.value == animal).type
                    let closedDaysByType = response.filter(el => el.animalType == type)
                    
                    closedDaysByType.forEach(el => {
                        if(new Date(el.endingDate) >= today && new Date(el.startingDate) >= today){
                            closedDates = [...closedDates, ...getDatesBetween(new Date(el.startingDate), new Date(el.endingDate))]
                        }
                        else if(new Date(el.endingDate) >= today && new Date(el.startingDate) < today){
                            closedDates = [...closedDates, ...getDatesBetween(today, new Date(el.endingDate))]
                        }
                    })
                }
                for(const day of closedDates){ /* block closed days */
                    newDates[day] = { disabled: true, disableTouchEvent: true, color: 'red', textColor: 'black'}
                }
            }
        })

        datesBeforeToday = [...getDatesBetween(firstDay, today.setDate(today.getDate() - 1))]

        for(const day of datesBeforeToday){ /* block dates from first day of month to today-1 */
            newDates[day] = { disabled: true, disableTouchEvent: true,  textColor: 'lightgrey'}
        }
        
        setclosedDaysStart(newDates)

    },  [animal])

    useEffect(() => { // after pick starting date, set closed days to pickers
        let newDates = JSON.parse(JSON.stringify(closedDaysEnd)) // get reference (markedDates param is immutable)
        newDates = {} // clear marked dates
        /* block every days from 1 day of month to picked start day */
        /* user can pick end day from start day to closedday-1 or infinite*/
        let date = new Date();
        let firstDay = new Date(date.getFullYear(), date.getMonth(), 1); // first day of month
        let startingDate = new Date(dateFrom);
        let beforePickedStartDate = new Array();

        beforePickedStartDate = [...getDatesBetween(firstDay, startingDate.setDate(startingDate.getDate()))]

        for(const day of beforePickedStartDate){ /* block dates from first day of month to today-1 */
            newDates[day] = { disabled: true, disableTouchEvent: true,  textColor: 'lightgrey'}
        }
        
        getDayOffByHotel(id).then(response => {
            let minDays = 0;
            let firstDayOff = {};
            let lastDayOfMonth;
            let daysBetween = new Array();

            if(response != null){
                if(userPets.some(el => el.value == animal)){

                    let type = userPets.find(el => el.value == animal).type
                    let closedDaysByType = response.filter(el => el.animalType == type) /* filter array using picked type in first step */
                    closedDaysByType = closedDaysByType.filter(el => new Date(el.startingDate) >= new Date(dateFrom)) /* filter dates, return only later than picked start */
                    setClosedDayInNextMonth(false);

                    if(closedDaysByType.length > 0) { /* day off in the future */
                        setClosedDayInNextMonth(true);
                        daysBetween = getDatesBetween(new Date(dateFrom), new Date(closedDaysByType[0].startingDate));
                        minDays = daysBetween.length
                        firstDayOff = closedDaysByType[0];

                        closedDaysByType.forEach(el => { /* find the first day off */
                            daysBetween = getDatesBetween(new Date(dateFrom), new Date(el.startingDate))
                            if(daysBetween.length < minDays){
                                minDays = daysBetween.length
                                firstDayOff = el
                            }
                        })
                        lastDayOfMonth = new Date(firstDayOff.startingDate);
                        lastDayOfMonth = new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth()+1)

                        daysBetween = [];
                        daysBetween = getDatesBetween(new Date(firstDayOff.startingDate), lastDayOfMonth);
                        
                        for(const day of daysBetween){ /* block dates from first day off to last day of month */
                            newDates[day] = { disabled: true, disableTouchEvent: true,  textColor: 'lightgrey'}
                        }
                        var getMonthFromFirstDayOff = new Date(firstDayOff.startingDate)
                        if(date.getMonth() == getMonthFromFirstDayOff.getMonth()){
                            setEndMonthCounterRight(monthDiff(new Date(dateFrom), new Date(firstDayOff.startingDate)))
                        }
                        else{
                            setEndMonthCounterRight(monthDiff(new Date(), new Date(firstDayOff.startingDate)))
                        }
                        
                    } /* if no day off in the future, give infinite opportunity pick date */

                }
            }
        })
        
        setclosedDaysEnd(newDates)

    },  [dateFrom])

    useEffect(() => { /* calculate final price */
        if(userPets.some(el => el.value == animal)){
            let daysBetween = new Array();
            let price;
            daysBetween = getDatesBetween(new Date(dateFrom), new Date(dateTo));
            price = priceList[userPets.find(el => el.value == animal).type]
            setFinalPrice((price*(daysBetween.length)).toFixed(2));
        }
    }, [dateTo])

    const validationSchema = Yup.object({
        animalId: Yup.string()
            .required('Wybierz zwierze'),
        checkIn: Yup.string()
            .required('Wybierz date poczatku pobytu'),
        checkOut: Yup.string()
            .required('Wybierz date konca pobytu'),
    })

    return (
        <View style={styles.screen}>
            <Formik
                validationSchema={validationSchema}
                validateOnChange={false}
                /*
                {
                    "id": 0,
                    "hotelId": 0,
                    "animalId": 0,
                    "checkIn": "2022-03-04",
                    "checkOut": "2022-03-04",
                    "status": "string"
                }
                */
                initialValues={{
                    hotelId: id,
                    animalId: '',
                    checkIn: '',
                    checkOut: '',
                    status: 'W'
                }}
                onSubmit ={
                    async(values) => {
                        if(userDataFilled){
                            const token = await SecureStore.getItemAsync('token')
                            axiosInstance.post('/api/saveReservation', {
                                hotelId: values.hotelId,
                                animalId: values.animalId,
                                checkIn: values.checkIn,
                                checkOut: values.checkOut,
                                status: values.status
                            },
                            {
                                headers:{
                                    Cookie: "PetMyPetJWT=" + token,
                                }
                            }
                            )
                            .then(res => {
                                Alert.alert(
                                    'Rezerwacja złożona!',
                                    'Twoje rezerwacja została złożona i oczekuje na decyzję właściciela hotelu!',
                                    [
                                        { text: "OK", onPress: () => {
                                            navigation.popToTop();
                                            navigation.navigate("ReservationListTab", {
                                                screen: 'ReservationListScreen',
                                            })
                                        }},
                                    ]
                                )

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
                        else{
                            Alert.alert(
                                'Uzupełnij profil!',
                                'Aby dokonać rezerwacji musisz się uzupełnić profil, kliknij ok aby przekierować cię do uzupełnienia danych!',
                                [
                                    { text: "Zamknij", style: "cancel" },
                                    { text: "OK", onPress: () => navigation.navigate('AccountUserTab', { screen: 'EditAccountUser', initial: false, }) },
                                ]
                            )
                        }
                    }
                }
            >
            {({
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                values,
                errors,
                isValid,
            }) => (
            <>
            <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                    <RNPickerSelect
                        onValueChange={(value) => {
                            if(animal != value){
                                if(endingDateVisible){
                                    setFieldValue("checkOut", '')
                                    setEndingDateVisible(false)
                                }
                                setAnimal(value)
                                setStartingDateVisible(true);
                                setFieldValue("animalId", value)
                                setFieldValue("checkIn", '')
                                setFinalPrice(0);
                            }
                        }}
                        items={userPets}
                        useNativeAndroidPickerStyle={false}
                        style={{
                            ...pickerSelectStyles,
                            iconContainer: {
                                top: 20,
                                right: 20,
                            },
                        }}
                        placeholder={{
                            label: 'Wybierz zwierze',
                            value: '',
                        }}
                        Icon={() => {
                            return <Icon name="arrow-down" size={24} />;
                        }}
                        value={animal}
                    />
                </View>
                {errors.animalId &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.animalId}</Text>
                }
                {startingDateVisible &&
                <View style={styles.inputContainer}>
                            <TextField
                                style={[styles.input, {color: "black"}]}
                                isData={true}
                                showData={() => {
                                    showDatepicker(1);
                                    setModalVisible(true);
                                }}
                                label="Wpisz datę poczatku pobytu"
                                labelTop="Data początku pobytu"
                                value={dateFrom}
                            />
                </View>
                }
                {errors.checkIn && startingDateVisible &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.checkIn}</Text>
                }
                {showDate == 1 &&  
                    <Modal visible={modalVisible}>
                        <View style={{flex: 1, justifyContent: "center"}}>
                            <View style={{alignItems: "center"}}>
                                <Text style={styles.calendarHeader}>Wybierz dzień początku pobytu:</Text>
                            </View>
                            <Calendar
                                hideExtraDays={true}
                                firstDay={1}
                                markingType={'period'}
                                markedDates={closedDaysStart}
                                onDayPress={day => {
                                    if(endingDateVisible){
                                        setFieldValue("checkOut", '')
                                        setDateTo("Data konca pobytu")
                                    }
                                    setDateFrom(day.dateString)
                                    setFieldValue("checkIn", day.dateString)
                                    setModalVisible(!modalVisible)
                                    setEndingDateVisible(true)
                                    setFinalPrice(0);
                                    setShowDate(null)
                                }}
                                onPressArrowLeft={subtractMonth => {
                                    subtractMonth()
                                    setStartMonthCounter(startMonthCounter-1);
                                }}
                                onPressArrowRight={addMonth => {
                                    addMonth()
                                    setStartMonthCounter(startMonthCounter+1);
                                }}
                                disableArrowLeft={startMonthCounter == 0 ? true : false}
                            />
                        </View>
                    </Modal> 
                }
                {endingDateVisible &&
                <View style={styles.inputContainer}>
                            <TextField
                                style={[styles.input, {color: "black"}]}
                                isData={true}
                                showData={() => {
                                    showDatepicker(2);
                                    setModalVisible(true);
                                }}
                                label="Wpisz datę końca pobytu"
                                labelTop="Data końca pobytu"
                                value={dateTo}
                            />
                </View>
                }
                {errors.checkOut && endingDateVisible &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.checkOut}</Text>
                }
                <View style={styles.singleInputContainer}>
                    <Text style={{fontFamily:"OpenSans_500Medium", color: "black"}}>Cena: {finalPrice}</Text>
                </View>
                {showDate == 2 &&  
                    <Modal visible={modalVisible}>
                        <View style={{flex: 1, justifyContent: "center"}}>
                            <View style={{alignItems: "center"}}>
                                <Text style={styles.calendarHeader}>Wybierz dzień końca pobytu:</Text>
                            </View>
                            <Calendar
                                hideExtraDays={true}
                                firstDay={1}
                                markingType={'period'}
                                markedDates={closedDaysEnd}
                                onDayPress={day => {
                                    setDateTo(day.dateString)
                                    setFieldValue("checkOut", day.dateString)
                                    setModalVisible(!modalVisible)
                                    setShowDate(null)
                                }}
                                onPressArrowLeft={subtractMonth => {
                                    subtractMonth()
                                    setEndMonthCounterLeft(endMonthCounterLeft-1);
                                }}
                                onPressArrowRight={addMonth => {
                                    addMonth()
                                    setEndMonthCounterLeft(endMonthCounterLeft+1);
                                }}
                                disableArrowLeft={endMonthCounterLeft == 0 ? true : false}
                                disableArrowRight={((endMonthCounterLeft == endMonthCounterRight) && closedDayInNextMonth) ? true : false}
                            />
                        </View>
                    </Modal> 
                }
            </View>
            <View style={styles.watermark}>
                <Icon name="paw" size={150} color={colors.primary} style={{opacity: 0.3}}/>
            </View>
            <View style={styles.saveButtonContainer}>
                <TouchableOpacity onPress={handleSubmit}>
                    <View style={[styles.saveButton, {backgroundColor: colors.primary}]}>
                        <Text style={styles.saveButtonText}>Zarezerwuj</Text>
                    </View>
                </TouchableOpacity>
            </View>
            </>
            )}
            </Formik>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "white",
    },
    formSection:{
        flex:5,
        marginTop: "5%",
        marginLeft: "10%",
        marginRight: "10%",
        flexDirection: "column",
    },
    inputContainer: {
        paddingVertical: 20,
    },
    singleInputContainer:{

        paddingVertical: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    inputCalendarContainer:{
        flex:3,
        justifyContent: "center",
        alignItems: "stretch",
    },
    iconCalendar: {
        flex:1,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    input:{
        height: 65,
        padding: 10,
        backgroundColor:"#f0f0f0",
        borderRadius: 8,
    },
    inputData:{
        height: 65,
        backgroundColor:"#f0f0f0",
        borderRadius: 8,
    },
    watermark: {
        flex: 3,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonContainer:{
        marginTop: 15,
        marginBottom: 20,
        marginHorizontal: "30%",
    },
    saveButton: {
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderRadius: 20,
    },
    saveButtonText:{
        fontFamily: "OpenSans_600SemiBold",
    },
    calendarHeader:{
        fontFamily: "OpenSans_500Medium",
    },
    regularFontFamily:{
        color: "black",
        fontFamily: "OpenSans_400Regular",
    },
});
const pickerSelectStyles = StyleSheet.create({
    placeholder: {
        color: "grey",
    },
    inputIOS: {
      fontSize: 14,
      fontFamily: "OpenSans_400Regular",
      padding: 10,
      height: 65,
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
      backgroundColor:"#f0f0f0",
    },
    inputAndroid: {
      fontSize: 14,
      fontFamily: "OpenSans_400Regular",
      padding: 10,
      height: 65,
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
      backgroundColor:"#f0f0f0",
    },
  });
export default BookingScreen;