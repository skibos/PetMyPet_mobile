import React, {useEffect, useState} from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, FlatList, Switch, Modal, Alert} from 'react-native';
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
import getHotelDetails from '../services/getHotelDetails'
import getClosedDaysByOwner from '../services/getClosedDaysByOwner'
import patchHotel from '../services/patchHotel'

const EditHotelScreen = ({ route, navigation }) => {
    const { colors } = useTheme();
    const { id } = route.params;

    const [data, setData] = useState({
      name:'',
      description:'',
      street:'',
      zipcode:'',
      city:'',
      phoneNumber:'',
      contactEmail:'',
    });

    useEffect(() => {
      getHotelDetails(id).then(res => setData(res));

    }, []);
    
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Uzupełnij nazwę hotelu'),
        description: Yup.string()
            .required('Uzupełnij opis'),
        street: Yup.string()
            .required('Uzupełnij ulicę'),
        zipcode: Yup.string()
            .required("Uzupełnij kod pocztowy"),
        city: Yup.string()
            .required("Uzupełnij miasto"),
        phoneNumber: Yup.string()
            .required("Uzupełnij numer telefonu"),
        contactEmail: Yup.string()
            .required("Uzupełnij email kontaktowy"),
    })

    return (
    <KeyboardAwareScrollView>
        <ScrollView style={styles.screen}>
            <View style={styles.formSection}>
                <Formik
                    validationSchema={validationSchema}
                    validateOnChange={true}
                    enableReinitialize={true}
                    initialValues={{
                        name: data.name ? data.name : '',
                        description: data.description ? data.description : '',
                        street: data.street ? data.street : '',
                        zipcode: data.zipcode ? data.zipcode : '',
                        city: data.city ? data.city : '',
                        phoneNumber: data.phoneNumber ? data.phoneNumber : '',
                        contactEmail: data.contactEmail ? data.contactEmail : '',
                    }}
                    onSubmit ={
                         async(values) => {
                             patchHotel(
                                 id,
                                 values.name,
                                 values.description,
                                 values.street,
                                 values.zipcode,
                                 values.city,
                                 values.phoneNumber,
                                 values.contactEmail
                             )
                            .then((res) => {
                                
                                Alert.alert(
                                    '',
                                    'Informacje o Twoim hotelu zostały zaktualizowane pomyślnie',
                                    [{ text: "OK" }]
                                )
                            }
                            )
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
                        <TextField
                            style={styles.input}
                            value={values.name}
                            onChangeText={handleChange('name')}
                            label="Wpisz nazwę hotelu"
                            labelTop="Nazwa hotelu"
                        />
                    </View>
                    {errors.name &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.name}</Text>
                    }
                    <View style={styles.inputContainerMulti}>
                        <TextField
                            multiline={true}
                            style={styles.inputDescription}
                            value={values.description}
                            onChangeText={handleChange('description')}
                            label="Wpisz opis hotelu"
                            labelTop="Opis hotelu"
                            numberOfLines={4}
                        />
                    </View>
                    {errors.description &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.description}</Text>
                    }
                    <View style={styles.inputContainer}>
                        <TextField
                            style={styles.input}
                            value={values.street}
                            onChangeText={handleChange('street')}
                            label="Wpisz ulicę"
                            labelTop="Ulica"
                        />
                    </View>
                    {errors.street &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.street}</Text>
                    }
                    <View style={styles.inputContainer}>
                        <TextField
                            style={styles.input}
                            value={values.zipcode}
                            onChangeText={handleChange('zipcode')}
                            label="Wpisz kod pocztowy"
                            labelTop="Kod pocztowy"
                        />
                    </View>
                    {errors.zipcode &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.zipcode}</Text>
                    }
                    <View style={styles.inputContainer}>
                        <TextField
                            style={styles.input}
                            value={values.city}
                            onChangeText={handleChange('city')}
                            label="Wpisz miasto"
                            labelTop="Miasto"
                        />
                    </View>
                    {errors.city &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.city}</Text>
                    }
                    <View style={styles.inputContainer}>
                        <TextField
                            style={styles.input}
                            value={values.phoneNumber}
                            onChangeText={handleChange('phoneNumber')}
                            label="Wpisz numer telefonu"
                            labelTop="Numer telefonu"
                        />
                    </View>
                    {errors.phoneNumber &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.phoneNumber}</Text>
                    }
                    <View style={styles.inputContainer}>
                        <TextField
                            style={styles.input}
                            value={values.contactEmail}
                            onChangeText={handleChange('contactEmail')}
                            label="Wpisz email hotelu"
                            labelTop="Email hotelu"
                        />
                    </View>
                    {errors.contactEmail &&
                        <Text style={{ fontSize: 10, color: 'red' }}>{errors.contactEmail}</Text>
                    }
                    
                    
                    
                    <View style={styles.saveButtonContainer}>
                        <TouchableOpacity onPress={handleSubmit}>
                                <View style={[styles.saveButton, {backgroundColor: colors.primary}]}>
                                    <Text style={styles.saveButtonText}>Zapisz</Text>
                                </View>
                        </TouchableOpacity>
                    </View>
                    </>
                )}
                </Formik>
            </View>

            <View style={{width: "90%", height: 1, alignSelf: "center",backgroundColor: "lightgrey"}}/>
            
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
    dataModalButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
        height: 40,
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

export default EditHotelScreen;