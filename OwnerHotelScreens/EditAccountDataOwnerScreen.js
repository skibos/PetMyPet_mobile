import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import * as Yup from "yup";
import { Formik } from "formik";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../services/axiosInstanceConfig';
import * as SecureStore from 'expo-secure-store';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import getOwnerAccountDetails from '../services/getOwnerAccountDetails';
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';

const EditAccountDataOwnerScreen = ({ route, navigation }) => {
    const { colors } = useTheme();

    const [data, setData] = useState([]);

    useEffect(() => {
        getOwnerAccountDetails().then(res => setData(res));
    }, [])

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('To nie jest poprawny adres e-mail')
            .required('Wpisz swój adres e-mail'),
        firstName: Yup.string()
            .required('Uzupełnij swoje imię'),
        lastName: Yup.string()
            .required('Uzupełnij swoje nazwisko'),
        city: Yup.string()
            .required('Uzupełnij swoje miasto'),
        street: Yup.string()
            .required("Wpisz swój adres"),
        zipcode: Yup.string()
            .required("Uzupełnij swój kod pocztowy"),
        phoneNumber: Yup.string()
            .min(9, 'Niepoprawny numer telefonu')
            .max(9, 'Niepoprawny numer telefonu')
            .required("Uzupełnij swój numer telefonu"),
        name: Yup.string()
            .required("Uzupełnij nazwę firmy"),
        nip: Yup.string()
            .min(10, 'Niepoprawny numer NIP')
            .max(10, 'Niepoprawny numer NIP')
            .required('Uzupełnij NIP'),
        regon: Yup.string()
            .min(9, 'Niepoprawny numer REGON')
            .max(9, 'Niepoprawny numer REGON')
            .required("Uzupełnij REGON")
    })

    return (
    <KeyboardAwareScrollView extraHeight={Platform.select({ ios: 100 })}>
        <ScrollView>
            <View style={styles.formSection}>
                <Formik
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                    initialValues={{
                        email: data.username ? data.username : '',
                        firstName: data.firstName ? data.firstName : '',
                        lastName: data.lastName ? data.lastName : '',
                        street: data.street ? data.street : '',
                        zipcode: data.zipcode ? data.zipcode : '',
                        city: data.city ? data.city : '',
                        phoneNumber: data.phoneNumber ? data.phoneNumber : '',
                        name: data.name ? data.name : '',
                        nip: data.nip ? data.nip : '',
                        regon: data.regon ? data.regon : ''
                    }}
                    onSubmit={
                        async (values) => {
                            const token = await SecureStore.getItemAsync('token')
                            axiosInstance.patch('/api/patchOwnerWithDetails', {
                                username: values.email,
                                firstName: values.firstName,
                                lastName: values.lastName,
                                street: values.street,
                                zipcode: values.zipcode,
                                city: values.city,
                                phoneNumber: values.phoneNumber,
                                name: values.name,
                                nip: values.nip,
                                regon: values.regon,
                            },
                            {
                                headers:{
                                    Cookie: "PetMyPetJWT=" + token,
                                }
                            }
                            )
                            .then(() => {
                              Alert.alert(
                                'Zaktualizowano pomyślnie!',
                                'Informacje o Twoim koncie zostały zaktualizowane!',
                                [{ text: "OK", onPress: () => navigation.goBack() }]
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
                    }
                >
                    {({
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        values,
                        errors,
                        isValid,
                    }) => (
                        <>
                            <View style={styles.email}>
                                <Text>Email</Text>
                                <Text style={{color: "grey"}}>{data.username}</Text>
                            </View>

                            {errors.firstName &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.firstName}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz imię"
                                    labelTop="Imię"
                                    value={values.firstName}
                                    onChangeText={handleChange('firstName')}
                                />
                            </View>

                            {errors.lastName &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.lastName}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz nazwisko"
                                    labelTop="Nazwisko"
                                    value={values.lastName}
                                    onChangeText={handleChange('lastName')}
                                />
                            </View>

                            {errors.street &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.street}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz ulicę"
                                    labelTop="Ulica"
                                    value={values.street}
                                    onChangeText={handleChange('street')}
                                />
                            </View>

                            {errors.city &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.city}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz miasto"
                                    labelTop="Miasto"
                                    value={values.city}
                                    onChangeText={handleChange('city')}
                                />
                            </View>

                            {errors.zipcode &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.zipcode}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz kod pocztowy"
                                    labelTop="Kod pocztowy"
                                    value={values.zipcode}
                                    onChangeText={handleChange('zipcode')}
                                />
                            </View>

                            {errors.phoneNumber &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.phoneNumber}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz numer telefonu"
                                    labelTop="Numer telefonu"
                                    value={values.phoneNumber}
                                    onChangeText={handleChange('phoneNumber')}
                                />
                            </View>

                            {errors.companyName &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.companyName}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz nazwę firmy"
                                    labelTop="Nazwa firmy"
                                    value={values.name}
                                    onChangeText={handleChange('name')}
                                />
                            </View>

                            {errors.nip &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.nip}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz nip"
                                    labelTop="Nip"
                                    value={values.nip}
                                    onChangeText={handleChange('nip')}
                                />
                            </View>

                            {errors.regon &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.regon}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Wpisz regon"
                                    labelTop="Regon"
                                    value={values.regon}
                                    onChangeText={handleChange('regon')}
                                />
                            </View>
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
        </ScrollView>
    </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
  screen: {
    flex:1,
    backgroundColor: "white"
  },
  formSection: {
    marginTop: "5%",
    marginLeft: "10%",
    marginRight: "10%",
    flexDirection: "column",
  },
  email: {
    flex:1,
    padding: 8,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  inputContainer: {
    flex:1,
    paddingTop: 15,
  },
  input:{
    height: 65,
    padding: 10,
    backgroundColor:"#f0f0f0",
    borderRadius: 8,
  },
  saveButtonContainer:{
    marginTop: 15,
    marginBottom: 20,
    marginHorizontal: "30%",
  },
  saveButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightgreen",
    height: 40,
    borderRadius: 20,
  },
  saveButtonText:{
    fontFamily: "OpenSans_600SemiBold"
  }
});

export default EditAccountDataOwnerScreen;