import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, TouchableHighlight, Platform, Modal, TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import axiosInstance from '../services/axiosInstanceConfig';
import * as SecureStore from 'expo-secure-store';
import getAnimalTypes from '../storage/getAnimalTypes';
import * as Yup from "yup";
import { Formik } from "formik";
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getHotelDetails from '../services/getHotelDetails';

const AddDayOffScreen = ({ route, navigation }) => {
    const { colors } = useTheme();
    const [hotelName, setHotelName] = useState();
    const [hotelId, setHotelId] = useState();
    const [typeAnimals, setTypeAnimals] = useState([]); /* list to picker */
    
    const [dateFrom, setDateFrom] = useState(new Date());
    const [dateTo, setDateTo] = useState(new Date());
    const [showDate, setShowDate] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    const onChangeDateFrom = (event, selectedDate) => {
        const currentDate = selectedDate || dateFrom;
        if(Platform.OS === "android")
            setShowDate(0);
        setDateFrom(currentDate);

        if(dateTo < currentDate){
            setDateTo(currentDate);
        }
    };

    const onChangeDateTo = (event, selectedDate) => {
        const currentDate = selectedDate || dateTo;
        if(Platform.OS === "android")
            setShowDate(0);
        setDateTo(currentDate);
      };

    const showDatepicker = (arg) => {
        setShowDate(arg);
    };

    useEffect(async() => {
        try {
            const id = await AsyncStorage.getItem('editHotelId')
            if(id !== null) {
                setHotelId(parseInt(id))
                getHotelDetails(id).then((data) => setHotelName(data.name))
            }
        } catch(e) {
            console.log(e)
        }

        getTypes();
        
    },  [])

        function getTypes(){ // get hotels from asyncStorage and convert to picker format
            getAnimalTypes().then(res => {
                let types = [];
                let singleType = {};
                Object.entries(res).forEach(entry => { // foreach using key value of object
                    const [key, value] = entry;
                    singleType = {
                        label  : value.charAt(0).toUpperCase() + value.slice(1), // first letter upperCase - np. Kot
                        value  : key // np. 1
                    }
                    types.push(singleType);
                })
                setTypeAnimals(types);
            })
        }

        const validationSchema = Yup.object({
            animalType: Yup.string()
                .required('Uzupełnij typ zwierzęcia'),
            startingDate: Yup.string()
                .required('Wpisz datę początkową'),
            endingDate: Yup.string()
                .required('Wpisz datę końcową'),
        })

    return (
        <View style={styles.screen}>
            <Formik
                validationSchema={validationSchema}
                validateOnChange={false}
                initialValues={{
                    animalType: '',
                    startingDate: dateFrom.toISOString().split('T')[0] ? dateFrom.toISOString().split('T')[0] : '',
                    endingDate: dateTo.toISOString().split('T')[0] ? dateTo.toISOString().split('T')[0] : '',
                    hotelName: '',
                }}
                onSubmit ={
                    async(values) => {
                        const token = await SecureStore.getItemAsync('token')
                        axiosInstance.post('/api/saveClosedDay', {
                            hotelId     : hotelId,
                            animalType  : values.animalType,
                            startingDate: values.startingDate,
                            endingDate  : values.endingDate,
                            hotelName   : hotelName
                        },
                        {
                            headers:{
                                Cookie: "PetMyPetJWT=" + token,
                            }
                        }
                        )
                            .then((res) => {
                            navigation.navigate("EditHotelTab", {
                                screen: 'DaysOffScreen',
                            })}
                            )
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

                <View style={styles.inputData}>
                    <TextField
                        style={[styles.input, {color: "black"}]}
                        label="Wpisz od kiedy"
                        labelTop="Od kiedy"
                        isData={true}
                        showData={() => {
                            showDatepicker(1);
                            setModalVisible(true);
                        }}
                        value={dateFrom.toISOString().split('T')[0]}
                    />
                </View>
                {errors.startingDate &&
                    <Text style={{ fontSize: 10, color: 'red' }}>{errors.startingDate}</Text>
                }
                {showDate == 1 && (Platform.OS === "ios" ? (
                        <Modal
                            visible={modalVisible}
                        >
                            <DateTimePicker
                                value={dateFrom}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    onChangeDateFrom(event, selectedDate)
                                    if( selectedDate !== undefined){
                                        setFieldValue("startingDate", selectedDate.toISOString().split('T')[0])
                                    }
                                    else{
                                        setFieldValue("startingDate", new Date().toISOString().split('T')[0])
                                    }
                                }}
                                themeVariant="light"
                                style={{ flex: 1 }}
                            />
                            <View style={styles.saveButtonContainer}>
                                <TouchableOpacity onPress={() => {
                                    setModalVisible(!modalVisible)
                                    setShowDate(0)
                                }}>
                                        <View style={[styles.saveButton, {backgroundColor: colors.primary, marginBottom: 100}]}>
                                            <Text style={styles.saveButtonText}>Zatwierdz date</Text>
                                        </View>
                                </TouchableOpacity>
                            </View>
                        </Modal> ) : (
                        <DateTimePicker
                        value={dateFrom}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            onChangeDateFrom(event, selectedDate)
                            if( selectedDate !== undefined){
                                setFieldValue("startingDate", selectedDate.toISOString().split('T')[0])
                            }
                            else{
                                setFieldValue("startingDate", new Date().toISOString().split('T')[0])
                            }
                        }}
                        />
                    ))}
                    <View style={styles.singleInputContainer}>

                                    <TextField
                                        style={[styles.input, {color: "black"}]}
                                        label="Wpisz do kiedy"
                                        labelTop="Do kiedy"
                                        isData={true}
                                        showData={() => {
                                            showDatepicker(2);
                                            setModalVisible(true);
                                        }}
                                        value={dateTo.toISOString().split('T')[0]}
                                    />
                    </View>
                {errors.endingDate &&
                    <Text style={{ fontSize: 10, color: 'red' }}>{errors.endingDate}</Text>
                }
                {showDate == 2 && (Platform.OS === "ios" ? (
                        <Modal
                            visible={modalVisible}
                        >
                            <DateTimePicker
                                value={dateTo}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    onChangeDateTo(event, selectedDate)
                                    if( selectedDate !== undefined){
                                        setFieldValue("endingDate", selectedDate.toISOString().split('T')[0])
                                    }
                                    else{
                                        setFieldValue("endingDate", new Date().toISOString().split('T')[0])
                                    }
                                }}
                                themeVariant="light"
                                style={{ flex: 1 }}
                                minimumDate={dateFrom}
                            />
                            <View style={styles.saveButtonContainer}> 
                                <TouchableOpacity onPress={() => {
                                        setModalVisible(!modalVisible)
                                        setShowDate(0)
                                }}>
                                        <View style={[styles.saveButton, {backgroundColor: colors.primary, marginBottom: 100}]}>
                                            <Text style={styles.saveButtonText}>Zatwierdz date</Text>
                                        </View>
                                </TouchableOpacity>
                            </View>
                        </Modal> ) : (
                        <DateTimePicker
                        value={dateTo}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            onChangeDateTo(event, selectedDate)
                            if( selectedDate !== undefined){
                                setFieldValue("endingDate", selectedDate.toISOString().split('T')[0])
                            }
                            else{
                                setFieldValue("endingDate", new Date().toISOString().split('T')[0])
                            }
                        }}
                        minimumDate={dateFrom}
                        />
                    ))}
                <View style={{paddingVertical: 15}}>
                    <RNPickerSelect
                        onValueChange={(value) => {
                            setFieldValue("animalType", value)
                        }}
                        items={typeAnimals}
                        useNativeAndroidPickerStyle={false}
                        style={{
                            ...pickerSelectStyles,
                            iconContainer: {
                                top: 20,
                                right: 20,
                            },
                        }}
                        placeholder={{
                            label: 'Wybierz typ zwierzecia',
                            value: "",
                        }}
                        Icon={() => {
                            return <Icon name="arrow-down" size={24} />;
                        }}
                        value={values.animalType}
                    />
                </View>
                {errors.animalType &&
                    <Text style={{ fontSize: 10, color: 'red' }}>{errors.animalType}</Text>
                }
            </View>
            <View style={styles.saveButtonContainer}>
                <TouchableOpacity onPress={handleSubmit}>
                    <View style={[styles.saveButton, {backgroundColor: colors.primary}]}>
                        <Text style={styles.saveButtonText}>Dodaj dzień wolny</Text>
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

export default AddDayOffScreen;