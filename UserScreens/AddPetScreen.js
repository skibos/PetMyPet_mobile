import React, {useEffect, useState} from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, Platform, Switch, Modal, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import getAnimalTypes from '../storage/getAnimalTypes';
import * as Yup from "yup";
import { Formik } from "formik";
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../services/axiosInstanceConfig';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';

const AddPetScreen = ({ route, navigation }) => {
    const { colors } = useTheme();

    const [birthDateOfPet, setbirthDateOfPet] = useState(new Date());
    const [birthDateInInput, setBirthDateInInput] = useState(false);

    const [showDate, setShowDate] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [typesAnimals, setTypesAnimals] = useState([]); /* object types animals from async storage */
    
    const onChangebirthDateOfPet = (event, selectedDate) => {
        const currentDate = selectedDate || birthDateOfPet;
        if(Platform.OS === "android")
            setShowDate(0);
        setbirthDateOfPet(currentDate);
        setBirthDateInInput(true);
    };

    const showDatepicker = (arg) => {
        setShowDate(arg);
    };

    useEffect(() => {
        getTypes();
    }, []);

    function getTypes(){ // get hotels from asyncStorage and convert to picker format
        getAnimalTypes().then(res => {
            let types = [];
            let singleType = {};
            Object.entries(res).forEach(entry => { // foreach using values of object
                const [key, value] = entry;
                singleType = {
                    label  : value.charAt(0).toUpperCase() + value.slice(1), // first letter upperCase - np. Kot
                    value  : key // np. 1
                }
                types.push(singleType);
            })
            setTypesAnimals(types);
        })
    }
    
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Uzupełnij imię'),
        weight: Yup.string()
            .required('Uzupełnij wagę'),
        animalType: Yup.string()
            .required('Uzupełnij typ zwierzęcia'),
        birthDate: Yup.string()
            .required("Uzupełnij date urodzin"),
        notes: Yup.string()
            .required("Uzupełnij opis"),
    })

    return (
    <KeyboardAwareScrollView>
        <ScrollView style={styles.screen}>
            <View style={styles.formSection}>
                <Formik
                    validationSchema={validationSchema}
                    validateOnChange={false}
                    initialValues={{
                        name: '',
                        weight: '',
                        animalType: '',
                        birthDate: birthDateOfPet.toISOString().split('T')[0] ? birthDateOfPet.toISOString().split('T')[0] : '',
                        vaccinations: '',
                        notes: '',
                        visibility: true,
                        owner: ''
                    }}
                    onSubmit ={
                        async(values) => {
                            const token = await SecureStore.getItemAsync('token')
                            const username = await SecureStore.getItemAsync('username')
                            
                            axiosInstance.post('/api/saveAnimal', {
                                name: values.name,
                                weight: values.weight,
                                animalType: values.animalType,
                                birthDate: values.birthDate,
                                vaccinations: values.vaccinations,
                                notes: values.notes,
                                visibility: true,
                                owner: username,
                                accommodatedIn: null
                            },
                            {
                                headers:{
                                    Cookie: "PetMyPetJWT=" + token,
                                }
                            }
                            )
                            .then((res) => 
                            
                            Alert.alert(
                                'Dodano pomyślnie!',
                                'Twój zwierzak został dodany!',
                                [{ text: "OK", onPress: () => navigation.navigate({
                                        name: 'ListOfPetsStack',
                                        params: {
                                            screen: 'ListOfPets',
                                            params: {
                                                addPet: res.data 
                                            }
                                        },
                                        merge: true,
                                    }) 
                                }]
                            )

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
                    <View style={styles.inputContainer}>
                        <RNPickerSelect
                            onValueChange={(value) => setFieldValue("animalType", value)}
                            items={typesAnimals}
                            useNativeAndroidPickerStyle={false}
                            style={{
                                ...pickerSelectStyles,
                                iconContainer: {
                                    top: 20,
                                    right: 20,
                                },
                            }}
                            placeholder={{
                                label: 'Typ zwierzaka',
                                value: '',
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
                    <View style={styles.inputContainer}>
                        <TextField
                            style={styles.input}
                            value={values.name}
                            onChangeText={handleChange('name')}
                            label="Wpisz imię"
                            labelTop="Imię"
                        />
                    </View>
                    {errors.name &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.name}</Text>
                    }
                    <View style={styles.inputContainer}>
                        <TextField
                            style={styles.input}
                            value={values.weight}
                            onChangeText={handleChange('weight')}
                            label="Wpisz wagę"
                            labelTop="Waga"
                            keyboardType="numeric"
                        />
                    </View>
                    {errors.weight &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.weight}</Text>
                    }
                        <View style={styles.inputContainer}>

                            <TextField
                                style={[styles.input, {color: "black"}]}
                                label="Wpisz datę urodzenia"
                                labelTop="Data urodzenia"
                                isData={true}
                                showData={() => {
                                    showDatepicker(1);
                                    setModalVisible(true);
                                }}
                                value={birthDateInInput ? birthDateOfPet.toISOString().split('T')[0] : null}
                            />

                        </View>
                    {errors.birthDate &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.birthDate}</Text>
                    }
                    {showDate == 1 && (Platform.OS === "ios" ? (
                            <Modal
                                visible={modalVisible}
                            >
                                <DateTimePicker
                                    value={birthDateOfPet}
                                    mode="date"
                                    display="spinner"
                                    onChange={(event, selectedDate) => {
                                        onChangebirthDateOfPet(event, selectedDate)
                                        if( selectedDate !== undefined){
                                            setFieldValue("birthDate", selectedDate.toISOString().split('T')[0])
                                        }
                                        else{
                                            setFieldValue("birthDate", new Date().toISOString().split('T')[0])
                                        }
                                    }}
                                    style={{ flex: 1 }}
                                    themeVariant="light"
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
                            value={birthDateOfPet}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                onChangebirthDateOfPet(event, selectedDate)
                                if( selectedDate !== undefined){
                                    setFieldValue("birthDate", selectedDate.toISOString().split('T')[0])
                                }
                                else{
                                    setFieldValue("birthDate", new Date().toISOString().split('T')[0])
                                }
                            }}                      
                            />
                        ))}
                    <View style={styles.inputContainerData}>
                        <Text style={styles.regularFontFamily}>Aktualne szczepienia: </Text>
                        <Switch
                            onValueChange={(value) => {setFieldValue("vaccinations", value)}}
                            value={values.vaccinations}
                        />
                    </View>
                    <View style={styles.inputContainerMulti}>
                        <TextField
                            multiline={true}
                            style={styles.inputDescription}
                            value={values.notes}
                            onChangeText={handleChange('notes')}
                            label="Wpisz opis / uwagi szczegółowe*"
                            labelTop="Opis / uwagi szczegółowe"
                            numberOfLines={4}
                        />
                    </View>
                    {errors.notes &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.notes}</Text>
                    }
                    
                    <View style={styles.saveButtonContainer}>
                        <TouchableOpacity onPress={handleSubmit}>
                                <View style={[styles.saveButton, {backgroundColor: colors.primary}]}>
                                    <Text style={styles.saveButtonText}>Dodaj</Text>
                                </View>
                        </TouchableOpacity>
                    </View>
                    </>
                )}
                </Formik>
            </View>
        </ScrollView>
    </KeyboardAwareScrollView>
    
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "white"
    },
    formSection: {
        marginTop: "5%",
        marginHorizontal: "10%",
        flexDirection: "column",
    },
    inputContainer: {
        paddingVertical: 20,
    },
    inputContainerMulti:{
        paddingVertical: 10,
    },
    inputDescription: {
        padding: 10,
        paddingTop: 20,
        paddingBottom: 20,
        flex:1,
        height: 85,
        backgroundColor:"#f0f0f0",
        borderRadius: 8,
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
    inputCalendar:{
        flex:1,
    },
    inputContainerData: {
        flex:1,
        paddingVertical: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    inputAndText:{
        flex: 7,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    calendarIcon:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
    },
    textNebenInput:{
        flex:2,
    },
    inputCalendarContainer:{
        flex:3,
    },
    vaccines: {
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

    regularFontFamily:{
        color: "black",
        fontFamily: "OpenSans_400Regular",
    },
    saveButtonText:{
        fontFamily: "OpenSans_600SemiBold"
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

export default AddPetScreen;