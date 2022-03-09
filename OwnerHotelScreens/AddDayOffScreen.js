import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableHighlight, Platform, Modal, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import axiosInstance from '../services/axiosInstanceConfig';
import * as SecureStore from 'expo-secure-store';
import getAnimalTypes from '../storage/getAnimalTypes';
import * as Yup from "yup";
import { Formik } from "formik";

const AddDayOffScreen = ({ route, navigation }) => {

    const [choosedHotelId, setChoosedHotelId] = useState({
        label  : "",
        value  : "",
        hotelId: ""
    });
    const [hotel, setHotel] = useState([]);             /* array to picker */
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

    useEffect(() => {
        getTypes();
        getHotels();
    },  [])

    async function getHotels(){ // get hotels from api and convert to picker format
        const username = await SecureStore.getItemAsync('username')
        const token = await SecureStore.getItemAsync('token')
        
        axiosInstance.get('/api/hotelByOwner/' + username,
        {
            headers: {
                Cookie: "PetMyPetJWT=" + token,
            },
        },
            { withCredentials: true }
        )
            .then((response) => {
                if(response.data.length > 0){
                    let hotels = [];
                    let singleHotel = {};
                    response.data.forEach(element => {
                        singleHotel = {
                             label  : element.name,
                             value  : element.name,
                             hotelId: element.id
                        }
                         hotels.push(singleHotel);
                    });
                    setHotel(hotels);
                }
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

        function findId(value){
            setChoosedHotelId(hotel.find(el => el.value == value)) 
        }

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
            hotelName: Yup.string()
                .required("Uzupełnij hotel"),
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
                            hotelId     : choosedHotelId.hotelId.toString(),
                            animalType  : values.animalType,
                            startingDate: values.startingDate,
                            endingDate  : values.endingDate,
                            hotelName   : values.hotelName
                        },
                        {
                            headers:{
                                Cookie: "PetMyPetJWT=" + token,
                            }
                        }
                        )
                            .then(res => navigation.navigate({
                                name: 'DaysOff',
                                params: { dayOff: res.data },
                                merge: true,
                            })
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
            <View style={styles.inputsContainer}>
                <View style={styles.singleInputContainer}>
                    <View style={styles.inputAndText}>
                        <View style={styles.textNebenInput}>
                            <Text>Od kiedy:</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            editable={false}
                            placeholder="Od kiedy"
                            value={dateFrom.toISOString().split('T')[0]}
                        />
                    </View>
                    <Icon name="calendar-arrow-right" size={40} onPress={() => {
                        showDatepicker(1);
                        setModalVisible(true);
                    }}/>
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
                                    setFieldValue("startingDate", selectedDate.toISOString().split('T')[0])
                                }}
                                style={{ flex: 1 }}
                            />
                            <TouchableHighlight
                                style={{marginBottom: 100 }}
                                onPress={() => {
                                    setModalVisible(!modalVisible)
                                    setShowDate(0)
                                }}
                            >
                                <View style={styles.addButton}>
                                    <Text>Zatwierdz date</Text>
                                </View>
                            </TouchableHighlight>
                        </Modal> ) : (
                        <DateTimePicker
                        value={dateFrom}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            onChangeDateFrom(event, selectedDate)
                            setFieldValue("startingDate", selectedDate.toISOString().split('T')[0])
                        }}
                        />
                    ))}
                <View style={styles.singleInputContainer}>
                    <View style={styles.inputAndText}>
                        <View style={styles.textNebenInput}>
                            <Text>Do kiedy:</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            editable={false}
                            placeholder="Od kiedy"
                            value={dateTo.toISOString().split('T')[0]}
                        />
                    </View>
                    <Icon name="calendar-arrow-left" size={40} onPress={() => {
                        showDatepicker(2);
                        setModalVisible(true);
                    }}/>
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
                                    setFieldValue("endingDate", selectedDate.toISOString().split('T')[0])
                                }}
                                style={{ flex: 1 }}
                                minimumDate={dateFrom}
                            />
                            <TouchableHighlight
                                style={{marginBottom: 100 }}
                                onPress={() => {
                                    setModalVisible(!modalVisible)
                                    setShowDate(0)
                                }}
                            >
                                <View style={styles.addButton}>
                                    <Text>Zatwierdz date</Text>
                                </View>
                            </TouchableHighlight>
                        </Modal> ) : (
                        <DateTimePicker
                        value={dateTo}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            onChangeDateTo(event, selectedDate)
                            setFieldValue("endingDate", selectedDate.toISOString().split('T')[0])
                        }}
                        minimumDate={dateFrom}
                        />
                    ))}
                <View style={{padding: 15}}>
                    <RNPickerSelect
                        onValueChange={(value) => {
                            findId(value)
                            setFieldValue("hotelName", value)
                        }}
                        items={hotel}
                        useNativeAndroidPickerStyle={false}
                        style={{
                            ...pickerSelectStyles,
                            iconContainer: {
                            top: 10,
                            right: 10,
                            },
                        }}
                        placeholder={{
                            label: 'Wybierz hotel',
                            value: '',
                        }}
                        Icon={() => {
                            return <Icon name="arrow-down" size={24} />;
                        }}
                        value={values.hotelName}
                    />
                </View>
                {errors.hotelName &&
                    <Text style={{ fontSize: 10, color: 'red' }}>{errors.hotelName}</Text>
                }
                <View style={{padding: 15}}>
                    <RNPickerSelect
                        onValueChange={(value) => {
                            setFieldValue("animalType", value)
                        }}
                        items={typeAnimals}
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
            <View style={styles.watermark}>
                <Icon name="panda" size={130} color="rgba(0,0,0,0.5)"/>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableHighlight onPress={handleSubmit}>
                    <View style={styles.addButton}>
                        <Text>Dodaj dzień wolny</Text>
                    </View>
                </TouchableHighlight>
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
        marginTop: 10,
        marginBottom: 10,
    },
    inputsContainer:{
        flex:4,
        marginLeft: 10,
        marginRight: 10,
    },
    singleInputContainer:{
        flex:1,
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    inputAndText:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 10,
    },
    textNebenInput:{
        flex:1
    },
    input:{
        flex: 3,
        height: 40,
        borderWidth: 1,
        padding: 10,
    },
    watermark: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonContainer: {
        flex: 1,
        justifyContent: "center",
    },
    addButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
        height: 40,
    }
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
    },
  });

export default AddDayOffScreen;