import React, {useEffect, useState} from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableHighlight, Platform, Switch, Modal} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import getAnimalTypes from '../storage/getAnimalTypes';
import * as Yup from "yup";
import { Formik } from "formik";
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../services/axiosInstanceConfig';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const AddPetScreen = ({ route, navigation }) => {

    const [birthDateOfPet, setbirthDateOfPet] = useState(new Date());

    const [showDate, setShowDate] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [typesAnimals, setTypesAnimals] = useState([]); /* object types animals from async storage */
    
    const onChangebirthDateOfPet = (event, selectedDate) => {
        const currentDate = selectedDate || birthDateOfPet;
        if(Platform.OS === "android")
            setShowDate(0);
        setbirthDateOfPet(currentDate);
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
            .required('Uzupełnij imie'),
        weight: Yup.string()
            .required('Uzupełnij wage'),
        animalType: Yup.string()
            .required('Uzupełnij typ zwierzęcia'),
        birthDate: Yup.string()
            .required("Uzupełnij date urodzin"),
        notes: Yup.string()
            .required("Uzupełnij opis"),
    })

    return (
    <KeyboardAwareScrollView>
        <ScrollView>
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
                            .then(res => navigation.navigate({
                                name: 'ListOfPets',
                                params: {
                                    addPet: res.data 
                                },
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
                    <View style={styles.inputContainer}>
                        <RNPickerSelect
                            onValueChange={(value) => setFieldValue("animalType", value)}
                            items={typesAnimals}
                            useNativeAndroidPickerStyle={false}
                            style={{
                                ...pickerSelectStyles,
                                iconContainer: {
                                top: 10,
                                right: 10,
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
                        <TextInput
                            style={styles.input}
                            value={values.name}
                            onChangeText={handleChange('name')}
                            placeholder="Imie"
                        />
                    </View>
                    {errors.name &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.name}</Text>
                    }
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={values.weight}
                            onChangeText={handleChange('weight')}
                            placeholder="Waga"
                            keyboardType="numeric"
                        />
                    </View>
                    {errors.weight &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.weight}</Text>
                    }
                    <View style={styles.inputContainerData}>
                        <View style={styles.inputAndText}>
                            <View style={styles.textNebenInput}>
                                <Text>Data urodzenia:</Text>
                            </View>
                            <View style={styles.inputCalendarContainer}>
                                <TextInput
                                    style={[styles.input, styles.inputCalendar]}
                                    editable={false}
                                    value={birthDateOfPet.toISOString().split('T')[0]}
                                />
                            </View>
                        </View>
                        <View style={styles.calendarIcon}>
                            <Icon name="calendar-arrow-right" size={40} onPress={() => {
                                showDatepicker(1);
                                setModalVisible(true);
                            }}/>
                        </View>
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
                                    onChange={onChangebirthDateOfPet}
                                    style={{ flex: 1 }}
                                />
                                <TouchableHighlight
                                    style={{marginBottom: 100 }}
                                    onPress={() => {
                                        setModalVisible(!modalVisible)
                                        setShowDate(0)
                                    }}
                                >
                                    <View style={styles.dataModalButton}>
                                        <Text>Zatwierdz date</Text>
                                    </View>
                                </TouchableHighlight>
                            </Modal> ) : (
                            <DateTimePicker
                            value={birthDateOfPet}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                onChangebirthDateOfPet(event, selectedDate)
                                setFieldValue("birthDate", selectedDate.toISOString().split('T')[0])
                            }}
                            />
                        ))}
                    <View style={styles.inputContainerData}>
                        <Text>Aktualne szczepienia: </Text>
                        <Switch
                            onValueChange={(value) => {setFieldValue("vaccinations", value)}}
                            value={values.vaccinations}
                        />
                    </View>
                    <View style={styles.inputContainerMulti}>
                        <TextInput
                            multiline={true}
                            style={styles.inputDescription}
                            value={values.notes}
                            onChangeText={handleChange('notes')}
                            placeholder="Opis / Uwagi szczegółowe*"
                            numberOfLines={4}
                        />
                    </View>
                    {errors.notes &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.notes}</Text>
                    }
                    <TouchableHighlight onPress={handleSubmit}>
                            <View style={styles.saveButton}>
                                <Text>Zapisz</Text>
                            </View>
                    </TouchableHighlight>
                    </>
                )}
                </Formik>
            </View>
        </ScrollView>
    </KeyboardAwareScrollView>
    
    );
};

const styles = StyleSheet.create({
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
        borderWidth: 1,
        padding: 10,
        flex:1,
        height: 80
    },
    input:{
        height: 40,
        borderWidth: 1,
        padding: 10,
        flex:1,
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
    saveButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DDD",
        height: 40,
        marginTop: 15,
        marginBottom: 20,
    },
    dataModalButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
        height: 40,
    }
});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 12,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'black',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'black',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });

export default AddPetScreen;