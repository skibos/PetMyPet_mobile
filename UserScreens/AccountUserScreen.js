import React, {useEffect, useState} from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableHighlight} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Yup from "yup";
import {Formik} from "formik";
import axiosInstance  from '../services/axiosInstanceConfig';
import { AuthContext } from "../storage/loginContext";
import * as SecureStore from 'expo-secure-store';

const AccountUserScreen = ({ route, navigation }) => {

    const { signOut } = React.useContext(AuthContext);

    const [editStatus, changeEditStatus] = useState({
        email: false,
        name: false,
        surname: false,
        street: false,
        city: false,
        zipcode: false,
        phone: false,
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
        });
    }

    const [data, setData] = useState([]);

    useEffect(() => {
        getDataFromApi()
    }, [])

    async function getDataFromApi() {

        const username = await SecureStore.getItemAsync('username')/* put getusernameandpass when will be fixed */
        const token = await SecureStore.getItemAsync('token')

        axiosInstance.get('/api/accountDetails/' + username,
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
            .catch(function(error) {
                console.log('There has been a problem with your fetch operation: ' + error.message);
                 // ADD THIS THROW error
                  throw error;
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
    })

    return (
        <ScrollView>
            <View style={styles.formSection}>

                <Formik
                    validationSchema={validationSchema}
                    enableReinitialize={true}
                    initialValues={{
                        email:          data.username       ? data.username     : '',
                        firstName:      data.firstName      ? data.firstName    : '',
                        lastName:       data.lastName       ? data.lastName     : '',
                        street:         data.street         ? data.street       : '',
                        zipcode:        data.zipcode        ? data.zipcode      : '',
                        city:           data.city           ? data.city         : '',
                        phoneNumber:    data.phoneNumber    ? data.phoneNumber  : '',
                        
                    }}
                    onSubmit={
                        async (values) => {
                            const token = await SecureStore.getItemAsync('token')

                            axiosInstance.patch('/api/patchAccountDetails/', {
                                username:    values.email,
                                firstName:   values.firstName,
                                lastName:    values.lastName,
                                street:      values.street,
                                zipcode:     values.zipcode,
                                city:        values.city,
                                phoneNumber: values.phoneNumber,
                              },
                              {
                                headers: {
                                    Cookie: "PetMyPetJWT=" + token,
                                },
                              })
                              .then(res => console.log(res.data))
                              .then(changeEditStatusAll)
                              .catch(function(error) {
                                console.log('There has been a problem with your fetch operation: ' + error.message);
                                 // ADD THIS THROW error
                                  throw error;
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
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("surname")}/>
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
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("street")}/>
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
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("city")}/>
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
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("zipcode")}/>
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
                                <Icon name="pencil-box" size={40} onPress={() => changeEditStatusHandler("phone")}/>
                            </View>
                            <TouchableHighlight onPress={handleSubmit}>
                                <View style={styles.saveButton}>
                                    <Text>Zapisz</Text>
                                </View>
                            </TouchableHighlight> 
                        </>
                    )}
                </Formik>
                
                <TouchableHighlight onPress={() => navigation.navigate("ListOfPets")}>
                    <View style={styles.listOfPetsButton}>
                        <Text>Lista zwierząt</Text>
                    </View>
                </TouchableHighlight> 
                <TouchableHighlight onPress={() => {signOut()}}>
                    <View style={styles.listOfPetsButton}>
                        <Text>Wyloguj</Text>
                    </View>
                </TouchableHighlight> 
            </View>
        </ScrollView>
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
    input:{
        height: 40,
        borderWidth: 1,
        padding: 10,
        width: "80%",
    },
    accountCompany:{
        flexDirection: "row",
        justifyContent: "space-between"
    },
    listOfPetsButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "lightgreen",
        height: 40,
        marginTop: 10,
    },
    saveButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DDD",
        height: 40,
        marginTop: 15,
        marginBottom: 20,
    },
});

export default AccountUserScreen;