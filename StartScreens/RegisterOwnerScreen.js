import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
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


const RegisterOwnerScreen = ({navigation}) => {
  const { colors } = useTheme();
  const { signIn } = React.useContext(AuthContext);

    const validationSchemaOwner = Yup.object({
    
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
      city: Yup.string().required("Uzupełnij swoje miasto"),
      street: Yup.string().required("Wpisz swój adres"),
      zipcode: Yup.string().required("Uzupełnij swój kod pocztowy"),
      phoneNumber: Yup.string()
        .min(9, "Niepoprawny numer telefonu")
        .max(9, "Niepoprawny numer telefonu")
        .required("Uzupełnij swój numer telefonu"),
    name: Yup.string().required("Uzupełnij nazwę firmy"),
    nip: Yup.string()
      .min(10, "Niepoprawny numer NIP")
      .max(10, "Niepoprawny numer NIP")
      .required("Uzupełnij NIP"),
    regon: Yup.string()
      .min(9, "Niepoprawny numer REGON")
      .max(9, "Niepoprawny numer REGON")
      .required("Uzupełnij REGON"),
  });

  return (
    <ScrollView style={styles.screen}>
      <View style={styles.formSection}>
        <Formik
          validationSchema={validationSchemaOwner}
          initialValues={{
            username: "",
            password: "",
            repeatPassword: "",
            firstName: "",
            lastName: "",
            street: "",
            zipcode: "",
            city: "",
            phoneNumber: "",
            name: "",
            nip: "",
            regon: "",
          }}
          onSubmit={(values) => { //TODO
            console.log(values)
              axiosInstance.post('/api/registerOwner', {

                username:    values.username,
                password:    values.password,
                authority:   'ROLE_OWNER',
                firstName:   values.firstName,
                lastName:    values.lastName,
                street:      values.street,
                zipcode:     values.zipcode,
                city:        values.city,
                phoneNumber: values.phoneNumber,
                name:        values.name,
                nip:         values.nip,
                regon:       values.regon

              }).then( res => {  //succesful register
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
                  label="Wpisz ulicę"
                  labelTop="Ulica"
                  value={formikProps.values.street}
                  onChangeText={formikProps.handleChange("street")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.street && formikProps.errors.street}
              </Text>

              <View style={styles.inputContainer}>
                <TextField
                  style={styles.input}
                  label="Wpisz miasto"
                  labelTop="Miasto"
                  value={formikProps.values.city}
                  onChangeText={formikProps.handleChange("city")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.city && formikProps.errors.city}
              </Text>

              <View style={styles.inputContainer}>
                <TextField
                  style={styles.input}
                  label="Wpisz kod pocztowy"
                  labelTop="Kod pocztowy"
                  value={formikProps.values.zipcode}
                  onChangeText={formikProps.handleChange("zipcode")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.zipcode && formikProps.errors.zipcode}
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
              <View> 
                <View style={styles.inputContainer}>
                  <TextField
                    style={styles.input}
                    label="Wpisz nazwę firmy"
                    labelTop="Nazwa firmy"
                    value={formikProps.values.name}
                    onChangeText={formikProps.handleChange("name")}
                  />
                </View>
                <Text style={styles.errorMsg}>
                  {formikProps.touched.name && formikProps.errors.name}
                </Text>

                <View style={styles.inputContainer}>
                  <TextField
                    style={styles.input}
                    label="Wpisz nip"
                    labelTop="Nip"
                    value={formikProps.values.nip}
                    onChangeText={formikProps.handleChange("nip")}
                  />
                </View>
                <Text style={styles.errorMsg}>
                  {formikProps.touched.nip && formikProps.errors.nip}
                </Text>

                <View style={styles.inputContainer}>
                  <TextField
                    style={styles.input}
                    label="Wpisz regon"
                    labelTop="Regon"
                    value={formikProps.values.regon}
                    onChangeText={formikProps.handleChange("regon")}
                  />
                </View>
                <Text style={styles.errorMsg}>
                  {formikProps.touched.regon && formikProps.errors.regon}
                </Text>
              </View>
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

export default RegisterOwnerScreen;
