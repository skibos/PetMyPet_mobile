import * as React from "react";
import {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ImageBackground,
  Image,
  SafeAreaView
  
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../storage/loginContext";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { signIn } = React.useContext(AuthContext);

  const validationSchema = Yup.object({
    username: Yup.string()
      .email("To nie jest poprawny adres e-mail")
      .required("Wpisz swój adres e-mail"),
    password: Yup.string()
      .min(4, "Hasło musi mieć co najmniej 4 znaki długości")
      .required("Wpisz swoje hasło"),
  });

  return (
    <ImageBackground source={require("../assets/loginbackground.jpg")} resizeMode="cover" style={styles.backgroundImage} imageStyle={{opacity:0.5}}>
      <KeyboardAvoidingView
      behavior={"padding"}
      style={styles.screen}
      keyboardVerticalOffset={20}
      >
      <View style={styles.screen}>
          <Formik
            validationSchema={validationSchema}
            initialValues={{
              username: "",
              password: "",
            }}
            onSubmit={(values) => {
              signIn(values)
            }}
          >
            {(formikProps) => (
              <View style={styles.formSection}>
                <View style={styles.inputSection}>
                  <View style={styles.inputContainer}>
                    <TextField
                      style={styles.input}
                      label="Wpisz Email"
                      labelTop="Email"
                      value={formikProps.values.username}
                      onChangeText={formikProps.handleChange('username')}
                    />
                  </View>
                  <Text style={{ fontSize: 10, color: 'red' }}>{ formikProps.touched.username && formikProps.errors.username}</Text>

                  <View style={styles.inputContainer}>
                    <TextField
                      secureTextEntry={true}
                      style={styles.input}
                      label="Wpisz hasło" 
                      labelTop="Hasło"
                      value={formikProps.values.password}
                      onChangeText={formikProps.handleChange('password')}
                    />
                  </View>
                  <Text style={{ fontSize: 10, color: 'red' }}>{ formikProps.touched.password && formikProps.errors.password}</Text>
                  <View style={styles.forgotPasswordTextContainer}>
                    <Text
                      onPress={() => {
                        navigation.navigate("ForgotPassword");
                      }}
                      style={styles.forgotPasswordText}
                    >
                      Przypomnij hasło
                    </Text>
                  </View>
                </View>
                  <View style={styles.loginButtonContainer}>
                    <TouchableOpacity onPress={formikProps.handleSubmit} >
                      <View style={[styles.loginButton, {backgroundColor: colors.primary}]}>
                        <Text style={styles.loginButtonText}>Zaloguj się</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
            )}
          </Formik>
          
          <View style={styles.footer}>
            <Text style={styles.baseText}>
              Nie posiadasz konta?
              <Text
                style={styles.registerText}
                onPress={() => {
                  navigation.navigate("Register");
                }}
              >
                {" "}
                Zarejestruj się
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundImage:{
    flex: 1,
  },

  formSection:{
    marginTop: "20%",
    flex: 7,
  },
  inputSection: {
    flex: 5,
    marginHorizontal: 20,
    flexDirection: "column",
  },
  inputContainer: {
    paddingVertical: 10,
  },
  input:{
    height: 65,
    padding: 10,
    backgroundColor:"#f0f0f0",
    borderRadius: 8,
  },
  loginButtonContainer:{
    marginHorizontal: "30%",
    marginTop: 60,
  },
  loginButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    borderRadius: 20,
  },
  loginButtonText:{
    fontFamily: "OpenSans_600SemiBold"
  },
  forgotPasswordTextContainer: {
    fontSize: 12,
    justifyContent:"flex-start",
    alignItems: "flex-end",
  },
  forgotPasswordText:{
    fontFamily: "OpenSans_400Regular"
  },
  footer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  baseText: {
    fontSize: 15,
    fontFamily: "OpenSans_400Regular"
  },
  registerText: {
    fontFamily: "OpenSans_600SemiBold",
  },
  regularFontFamily:{
    color: "black",
    fontFamily: "OpenSans_400Regular",
  },
});

export default LoginScreen;
