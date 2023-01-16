import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import * as SecureStore from "expo-secure-store";
import axiosInstance from '../services/axiosInstanceConfig'; 
import { createIconSetFromFontello } from "react-native-vector-icons";
import saveDatainSS from '../services/saveDataInSS';
import { AuthContext } from "../storage/loginContext";
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';

const RegisterUserScreen = ({navigation}) => {
  const { colors } = useTheme();
  const { signIn } = React.useContext(AuthContext);

  const validationSchemaUser = Yup.object({
    username: Yup.string()
      .email("To nie jest poprawny adres e-mail")
      .required("Wpisz swój adres e-mail"),
    password: Yup.string()
      .min(4, "Hasło musi mieć co najmniej 4 znaków długości")
      .required("Wpisz swoje hasło"),
    repeatPassword: Yup.string().oneOf(
      [Yup.ref("password")],
      "Podane hasła nie są identyczne"
    ),
    firstName: Yup.string().required("Uzupełnij swoje imię"),
    lastName: Yup.string().required("Uzupełnij swoje nazwisko"),
    phoneNumber: Yup.string()
      .min(9, "Niepoprawny numer telefonu")
      .max(9, "Niepoprawny numer telefonu")
      .required("Uzupełnij swój numer telefonu"),
    });


  return (
    <ScrollView style={styles.screen}>
      <View style={styles.formSection}>
        <Formik
          validationSchema={validationSchemaUser}
          initialValues={{
            username: "",
            password: "",
            repeatPassword: "",
            firstName: "",
            lastName: "",
            phoneNumber: ""
          }}
          onSubmit={(values) => {

              axiosInstance.post('/api/registerUser', {

                username:    values.username,
                password:    values.password,
                authority:   'ROLE_USER',
                firstName:   values.firstName,
                lastName:    values.lastName,
                street:      "",
                zipcode:     "",
                city:        "",
                phoneNumber: values.phoneNumber,
              }).then( () => {  //succesful register
                Alert.alert(
                    'Zarejestrowano pomyślnie!',
                    'Aby się zalogować kliknij w link aktywacyjny, który przyszedł na podany adres email!',
                    [{ text: "OK", onPress: () => navigation.navigate("Login") }]
                )
              })
              .catch(err => { //unsuccesful register

                alert("Konto o tym adresie email już istnieje.")
                console.log(err)
              })
            
          }}
        >
          {(formikProps) => (
            <View>
              <View style={styles.inputContainer}>
                <TextField
                  style={[styles.input, styles.inputWidth]}
                  label="Wpisz email"
                  labelTop="Email"
                  value={formikProps.values.username}
                  onChangeText={formikProps.handleChange("username")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.username && formikProps.errors.username}
              </Text>

              <View style={styles.inputContainer}>
                <TextField
                  style={[styles.input, styles.inputWidth]}
                  secureTextEntry={true}
                  label="Wpisz hasło"
                  labelTop="Hasło"
                  value={formikProps.values.password}
                  onChangeText={formikProps.handleChange("password")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.password && formikProps.errors.password}
              </Text>

              <View style={styles.inputContainer}>
                <TextField
                  style={styles.input}
                  secureTextEntry={true}
                  label="Powtórz hasło"
                  labelTop="Powtórz hasło"
                  value={formikProps.values.repeatPassword}
                  onChangeText={formikProps.handleChange("repeatPassword")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.repeatPassword && formikProps.errors.repeatPassword}
              </Text>

              <View style={styles.inputContainer}>
                <TextField
                  style={styles.input}
                  label="Wpisz imię"
                  labelTop="Imię"
                  value={formikProps.values.firstName}
                  onChangeText={formikProps.handleChange("firstName")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.firstName && formikProps.errors.firstName}
              </Text>

              <View style={styles.inputContainer}>
                <TextField
                  style={styles.input}
                  label="Wpisz nazwisko"
                  labelTop="Nazwisko"
                  value={formikProps.values.lastName}
                  onChangeText={formikProps.handleChange("lastName")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.lastName && formikProps.errors.lastName}
              </Text>

              <View style={styles.inputContainer}>
                <TextField
                  style={styles.input}
                  label="Wpisz numer telefonu"
                  labelTop="Numer telefonu"
                  value={formikProps.values.phoneNumber}
                  onChangeText={formikProps.handleChange("phoneNumber")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.phoneNumber &&
                  formikProps.errors.phoneNumber}
              </Text>
              <View style={styles.saveButtonContainer}>
                <TouchableOpacity onPress={formikProps.handleSubmit}>
                  <View style={[styles.saveButton, {backgroundColor: colors.primary}]}>
                    <Text style={styles.saveButtonText}>Zarejestruj się</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
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
  inputContainer: {
    flex:1,
    paddingBottom: 10,
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
    height: 40,
    borderRadius: 20,
  },
  saveButtonText:{
    fontFamily: "OpenSans_600SemiBold"
  },
  errorMsg: {
    fontSize: 10,
    color: "red",
    paddingBottom: 10,
  },
});

export default RegisterUserScreen;
