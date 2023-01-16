import React, {useState} from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axiosInstance from '../services/axiosInstanceConfig';
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';

const ForgotPasswordScreen = () => {
    const { colors } = useTheme();
    const [email, setEmail] = useState();

    const sendEmail = () => {

        //alert("Pressed!");
        axiosInstance.post('email/generateToken/' + email + '/' + 'pass').then( res => {

            alert("Na podany adres wysłano link resetujący hasło.");
        })
        .catch( err => {
            
            alert("Resetowanie hasła nie powiodło się.");
        })
    }

    return (
        <View style={styles.screen}>
            <View style={styles.formSection}>
                <View style={styles.inputContainer}>
                    <TextField
                        style={styles.input}
                        label="Wpisz email"
                        labelTop="Email"
                        value={email}
                        onChangeText={setEmail}
                     />
                </View>
                <View style={styles.forgotButtonContainer}>
                    <TouchableOpacity onPress={() => sendEmail()}>
                        <View style={[styles.forgotButton, {backgroundColor: colors.primary}]}>
                            <Text style={styles.forgotButtonText}>Odzyskaj hasło</Text>
                        </View>
                    </TouchableOpacity> 
                </View>
            </View>
            <View style={styles.waterMark}>
                <Icon name="lock-reset" size={180} color={colors.primary} style={{opacity: 0.3}}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    formSection: {
        flex: 3,
        marginTop: "10%",
        marginLeft: "10%",
        marginRight: "10%",
        flexDirection: "column",
    },
    inputContainer: {
        paddingBottom: 10,
    },
    input:{
        height: 65,
        padding: 10,
        backgroundColor:"#f0f0f0",
        borderRadius: 8,
    },
    forgotButtonContainer:{
        marginTop: 25,
        marginBottom: 20,
        marginHorizontal: "30%",
    },
    forgotButton: {
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderRadius: 20,
    },
    forgotButtonText:{
        fontFamily: "OpenSans_600SemiBold"
    },
    waterMark: {
        flex: 5,
        alignItems: "center",
    },
});

export default ForgotPasswordScreen;