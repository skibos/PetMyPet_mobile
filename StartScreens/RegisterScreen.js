import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableHighlight,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import * as SecureStore from "expo-secure-store";
import axiosInstance from '../services/axiosInstanceConfig'; 
import { createIconSetFromFontello } from "react-native-vector-icons";
import saveDatainSS from '../services/saveDataInSS';
import { AuthContext } from "../storage/loginContext";


const RegisterScreen = ({navigation}) => {

  const { signIn } = React.useContext(AuthContext);
  const [isCompany, setIsCompany] = useState(false);

  const [unsuccessfulRegister, setUnsuccessfulRegister] = useState('');

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
    city: Yup.string().required("Uzupełnij swoje miasto"),
    street: Yup.string().required("Wpisz swój adres"),
    zipcode: Yup.string().required("Uzupełnij swój kod pocztowy"),
    phoneNumber: Yup.string()
      .min(9, "Niepoprawny numer telefonu")
      .max(9, "Niepoprawny numer telefonu")
      .required("Uzupełnij swój numer telefonu"),
    });

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

  const companySwitch = () => {
    setIsCompany((previousState) => !previousState); // zmieniamy stan na przeciwny
  };

  return (
    <ScrollView>
      <View style={styles.header}>
        <Text style={styles.headerText}>REJESTRACJA</Text>
      </View>
      <View style={styles.formSection}>
        <View style={styles.accountCompany}>
          <Text>Konto firmowe</Text>
          <Switch onValueChange={companySwitch} value={isCompany} />
        </View>
        <Text style={{ color: 'red', textAlign: 'center', paddingBottom: 5 }}>{unsuccessfulRegister}</Text>

        <Formik
          validationSchema={ () => {      
            if(isCompany)
                return validationSchemaOwner;
            else
                return validationSchemaUser;
          }}
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
            
            if(isCompany){
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

                let credentials = {
                  username: values.username,
                  password: values.password
                }

                signIn(credentials); // login and redirect
                
              })
              .catch(err => { //unsuccesful register

                setUnsuccessfulRegister("Konto o tym adresie email już istnieje.")
                console.log(err)
              })
            }
            else{
              axiosInstance.post('/api/registerUser', {

                username:    values.username,
                password:    values.password,
                authority:   'ROLE_USER',
                firstName:   values.firstName,
                lastName:    values.lastName,
                street:      values.street,
                zipcode:     values.zipcode,
                city:        values.city,
                phoneNumber: values.phoneNumber,
              }).then( res => {  //succesful register

                let credentials = {
                  username: values.username,
                  password: values.password
                }

                signIn(credentials); // login and redirect

              })
              .catch(err => { //unsuccesful register

                setUnsuccessfulRegister("Konto o tym adresie email już istnieje.")
                console.log(err)
              })
            }

          }}
        >
          {(formikProps) => (
            <View>
              <View style={styles.iconAndInput}>
                <Icon name="account" size={40} />
                <TextInput
                  style={[styles.input, styles.inputWidth]}
                  placeholder="Wpisz email"
                  value={formikProps.values.username}
                  onChangeText={formikProps.handleChange("username")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.username && formikProps.errors.username}
              </Text>

              <View style={styles.iconAndInput}>
                <Icon name="lock" size={40} />
                <TextInput
                  style={[styles.input, styles.inputWidth]}
                  secureTextEntry={true}
                  placeholder="Wpisz hasło"
                  value={formikProps.values.password}
                  onChangeText={formikProps.handleChange("password")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.password && formikProps.errors.password}
              </Text>

              <View style={styles.inputWithoutIcon}>
                <TextInput
                  style={styles.input}
                  secureTextEntry={true}
                  placeholder="Powtórz hasło"
                  value={formikProps.values.repeatPassword}
                  onChangeText={formikProps.handleChange("repeatPassword")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.repeatPassword &&
                  formikProps.errors.repeatPassword}
              </Text>

              <View style={styles.inputWithoutIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Wpisz imię"
                  value={formikProps.values.firstName}
                  onChangeText={formikProps.handleChange("firstName")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.firstName && formikProps.errors.firstName}
              </Text>

              <View style={styles.inputWithoutIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Wpisz nazwisko"
                  value={formikProps.values.lastName}
                  onChangeText={formikProps.handleChange("lastName")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.lastName && formikProps.errors.lastName}
              </Text>

              <View style={styles.inputWithoutIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Wpisz ulice"
                  value={formikProps.values.street}
                  onChangeText={formikProps.handleChange("street")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.street && formikProps.errors.street}
              </Text>

              <View style={styles.inputWithoutIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Wpisz miasto"
                  value={formikProps.values.city}
                  onChangeText={formikProps.handleChange("city")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.city && formikProps.errors.city}
              </Text>

              <View style={styles.inputWithoutIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Wpisz kod pocztowy"
                  value={formikProps.values.zipcode}
                  onChangeText={formikProps.handleChange("zipcode")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.zipcode && formikProps.errors.zipcode}
              </Text>

              <View style={styles.inputWithoutIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Wpisz numer telefonu"
                  value={formikProps.values.phoneNumber}
                  onChangeText={formikProps.handleChange("phoneNumber")}
                />
              </View>
              <Text style={styles.errorMsg}>
                {formikProps.touched.phoneNumber &&
                  formikProps.errors.phoneNumber}
              </Text>
            { isCompany &&
              <View> 
                <View style={styles.inputWithoutIcon}>
                  <TextInput
                    style={styles.input}
                    placeholder="Wpisz nazwe firmy"
                    value={formikProps.values.name}
                    onChangeText={formikProps.handleChange("name")}
                  />
                </View>
                <Text style={styles.errorMsg}>
                  {formikProps.touched.name && formikProps.errors.name}
                </Text>

                <View style={styles.inputWithoutIcon}>
                  <TextInput
                    style={styles.input}
                    placeholder="Wpisz nip"
                    value={formikProps.values.nip}
                    onChangeText={formikProps.handleChange("nip")}
                  />
                </View>
                <Text style={styles.errorMsg}>
                  {formikProps.touched.nip && formikProps.errors.nip}
                </Text>

                <View style={styles.inputWithoutIcon}>
                  <TextInput
                    style={styles.input}
                    placeholder="Wpisz regon"
                    value={formikProps.values.regon}
                    onChangeText={formikProps.handleChange("regon")}
                  />
                </View>
                <Text style={styles.errorMsg}>
                  {formikProps.touched.regon && formikProps.errors.regon}
                </Text>
              </View>
              }
              <TouchableHighlight onPress={formikProps.handleSubmit}>
                <View style={styles.forgotButton}>
                  <Text>Zarejestruj się</Text>
                </View>
              </TouchableHighlight>
            </View>
          )}
        </Formik>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  errorMsg: {
    fontSize: 10,
    color: "red",
    paddingBottom: 15,
    paddingLeft: "20%",
  },
  header: {
    marginLeft: "10%",
    marginRight: "10%",
    paddingTop: 15,
    paddingBottom: 20,
    justifyContent: "center",
  },
  accountCompany: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
  },
  formSection: {
    marginLeft: "10%",
    marginRight: "10%",
    flexDirection: "column",
  },
  iconAndInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 0,
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
  },
  inputWidth: {
    width: "80%",
  },
  inputWithoutIcon: {
    paddingLeft: "20%",
    paddingBottom: 0,
  },
  forgotButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DDD",
    height: 40,
    marginTop: 0,
    marginBottom: 20,
  },
});

export default RegisterScreen;
