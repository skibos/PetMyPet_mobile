import React, {useEffect, useState} from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Yup from "yup";
import {Formik} from "formik";
import getUserAccountDetails from '../services/getUserAccountDetails';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from '../services/axiosInstanceConfig';
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';

const EditAccountDataUserScreen = ({navigation}) => {
  const { colors } = useTheme();

  const [data, setData] = useState({
    email:'',
    firstName:'',
    lastName:'',
    street:'',
    zipcode:'',
    city:'',
    phoneNumber:'',
  });

  useEffect(() => {
      getUserAccountDetails().then(res => setData(res));
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
    })




  return (
    <ScrollView style={styles.screen}>
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
                  .then(() => {
                    Alert.alert(
                        'Zaktualizowano pomyślnie!',
                        'Informacje o Twoim koncie zostały zaktualizowane!',
                        [{ text: "OK", onPress: () => navigation.goBack() }]
                    )
                  })
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
                        label="Wpisz imię"
                        labelTop="Imię"
                        style={styles.input}
                        placeholderTextColor="grey"
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
  );
}

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
    height: 60,
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
    height: 40,
    borderRadius: 20,
  },
  saveButtonText:{
    fontFamily: "OpenSans_600SemiBold"
  },
});

export default EditAccountDataUserScreen;