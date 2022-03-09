import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, Button, TouchableWithoutFeedback } from 'react-native';
import * as Yup from "yup";
import { Formik } from "formik";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../services/axiosInstanceConfig';
import { AuthContext } from "../storage/loginContext";
import * as SecureStore from 'expo-secure-store';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const AccountOwnerScreen = ({ route, navigation }) => {

    const { signOut } = React.useContext(AuthContext);

    const [editStatus, changeEditStatus] = useState({
        email: false,
        name: false,
        surname: false,
        street: false,
        city: false,
        zipcode: false,
        phone: false,
        companyName: false,
        nip: false,
        regon: false
    })

    const changeEditStatusHandler = (input) => {
        changeEditStatus({
            ...editStatus,
            [input]: true
        });
    }

    const changeEditStatusAll = () => {
        changeEditStatus({
            ...editStatus,
            email: false,
            name: false,
            surname: false,
            street: false,
            city: false,
            zipcode: false,
            phone: false,
            companyName: false,
            nip: false,
            regon: false
        });
    }

    const [data, setData] = useState([]);

    useEffect(() => {
        getDataFromApi()
    }, [])

    async function getDataFromApi() {
        const username = await SecureStore.getItemAsync('username')/* put getusernameandpass when will be fixed */
        const token = await SecureStore.getItemAsync('token')

        axiosInstance.get('/api/ownerAccountDetails/' + username,
        {
            headers: {
                Cookie: "PetMyPetJWT=" + token,
            },
        },
            { withCredentials: true }
        )
            .then((response) => {
                setData(response.data);
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
                                .then(changeEditStatusAll)
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
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={false}
                                    value={data.username}
                                />
                            </View>

                            {errors.firstName &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.firstName}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['name']}
                                    placeholder="imie"
                                    value={values.firstName}
                                    onChangeText={handleChange('firstName')}
                                    onBlur={handleBlur('firstName')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("name")} />
                            </View>

                            {errors.lastName &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.lastName}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['surname']}
                                    placeholder="nazwisko"
                                    value={values.lastName}
                                    onChangeText={handleChange('lastName')}
                                    onBlur={handleBlur('lastName')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("surname")} />
                            </View>

                            {errors.street &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.street}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['street']}
                                    placeholder="ulica"
                                    value={values.street}
                                    onChangeText={handleChange('street')}
                                    onBlur={handleBlur('street')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("street")} />
                            </View>

                            {errors.city &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.city}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['city']}
                                    placeholder="miasto"
                                    value={values.city}
                                    onChangeText={handleChange('city')}
                                    onBlur={handleBlur('city')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("city")} />
                            </View>

                            {errors.zipcode &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.zipcode}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['zipcode']}
                                    placeholder="kod pocztowy"
                                    value={values.zipcode}
                                    onChangeText={handleChange('zipcode')}
                                    onBlur={handleBlur('zipcode')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("zipcode")} />
                            </View>

                            {errors.phoneNumber &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.phoneNumber}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['phone']}
                                    placeholder="numer telefonu"
                                    value={values.phoneNumber}
                                    onChangeText={handleChange('phoneNumber')}
                                    onBlur={handleBlur('phoneNumber')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("phone")} />
                            </View>

                            {errors.companyName &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.companyName}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['companyName']}
                                    placeholder="nazwa firmy"
                                    value={values.name}
                                    onChangeText={handleChange('name')}
                                    onBlur={handleBlur('name')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("companyName")} />
                            </View>

                            {errors.nip &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.nip}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['nip']}
                                    placeholder="nip"
                                    value={values.nip}
                                    onChangeText={handleChange('nip')}
                                    onBlur={handleBlur('nip')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("nip")} />
                            </View>

                            {errors.regon &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.regon}</Text>
                            }
                            <View style={styles.iconAndInput}>
                                <TextInput
                                    style={styles.input}
                                    editable={editStatus['regon']}
                                    placeholder="regon"
                                    value={values.regon}
                                    onChangeText={handleChange('regon')}
                                    onBlur={handleBlur('regon')}
                                />
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("regon")} />
                            </View>
                            
                            <TouchableWithoutFeedback onPress={handleSubmit}>
                                <View style={styles.forgotButton}>
                                    <Text>Zapisz</Text>
                                </View>
                            </TouchableWithoutFeedback>   

                            <TouchableWithoutFeedback onPress={() => {signOut()}}>
                                <View style={styles.forgotButton}>
                                    <Text>Wyloguj</Text>
                                </View>
                            </TouchableWithoutFeedback>   
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
        marginLeft: "10%",
        marginRight: "10%",
        flexDirection: "column",
    },
    iconAndInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 15,
    },
    input: {
        height: 40,
        borderWidth: 1,
        padding: 10,
        width: "80%",
    },
    accountCompany: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    forgotButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DDD",
        height: 40,
        marginTop: 10,
        marginBottom: 20,
    },
});

export default AccountOwnerScreen;