import * as React from "react";
import {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  KeyboardAvoidingView
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Formik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../storage/loginContext";


const LoginScreen = ({ navigation }) => {

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
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={styles.screen}
    enabled={false}
    >
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerText}>LOGOWANIE</Text>
      </View>

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
            <View style={styles.iconAndInput}>
              <Icon name="account" size={40} />
              <TextInput
                style={styles.input}
                placeholder="Wpisz email"
                value={formikProps.values.username}
                onChangeText={formikProps.handleChange('username')}
              />
            </View>
            <Text style={{ fontSize: 10, color: 'red' }}>{ formikProps.touched.username && formikProps.errors.username}</Text>

            <View style={styles.iconAndInput}>
              <Icon name="lock" size={40} />
              <TextInput
                secureTextEntry={true}
                style={styles.input}
                placeholder="Wpisz hasło"
                value={formikProps.values.password}
                onChangeText={formikProps.handleChange('password')}
              />
            </View>
            <Text style={{ fontSize: 10, color: 'red' }}>{ formikProps.touched.password && formikProps.errors.password}</Text>

            <TouchableHighlight onPress={formikProps.handleSubmit} >
              <View style={styles.loginButton}>
                <Text>Zaloguj się</Text>
              </View>
            </TouchableHighlight>

            <View style={styles.forgotPasswordText}>
              <Text
                onPress={() => {
                  navigation.navigate("ForgotPassword");
                }}
              >
                Przypomnij hasło
              </Text>
            </View>
          </View>
        )}
      </Formik>
      <View style={styles.waterMark}>
        <Icon name="dog-side" size={150} color="rgba(0,0,0,0.5)" />
      </View>
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
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flex: 2,
    justifyContent: "flex-end",
    margin: "10%",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "bold",
  },
  formSection: {
    flex: 3,
    marginLeft: "10%",
    marginRight: "10%",
    flexDirection: "column",
  },
  iconAndInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    height: 40,
    width: "80%",
    borderWidth: 1,
    padding: 10,
  },
  loginButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DDD",
    height: 40,
    marginTop: 10,
  },
  forgotPasswordText: {
    paddingTop: 10,
    fontSize: 12,
  },
  waterMark: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  baseText: {
    fontSize: 15,
  },
  registerText: {
    fontWeight: "bold",
  },
});

export default LoginScreen;
