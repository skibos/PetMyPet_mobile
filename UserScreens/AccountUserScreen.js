import React, {useEffect, useState} from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from "../storage/loginContext";
import deleteUser from '../services/deleteUser';
const AccountUserScreen = ({ route, navigation }) => {

    const { signOut } = React.useContext(AuthContext);

    return (
        <View style={styles.screen}>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("EditAccountUser")}>
                    <View style={styles.button}>
                        <View style={styles.textContainer}>
                            <Text style={styles.buttonText}>Profil użytkownika</Text>
                        </View>
                        <View style={styles.arrow}>
                            <Icon name="chevron-right" size={30}/>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => navigation.navigate("ListOfPetsTab")}>
                    <View style={styles.button}>
                        <View style={styles.textContainer}>
                            <Text style={styles.buttonText}>Lista Zwierząt</Text>
                        </View>
                        <View style={styles.arrow}>
                            <Icon name="chevron-right" size={30}/>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => {signOut()}}>
                    <View style={styles.button}>
                        <View style={styles.textContainer}>
                            <Text style={styles.buttonText}>Wyloguj</Text>
                        </View>
                        <View style={styles.arrow}>
                            <Icon name="chevron-right" size={30}/>
                        </View>
                    </View>
                </TouchableOpacity>
            </View> 
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => {deleteUser().then(() => signOut())}}>
                    <View style={styles.button}>
                        <View style={styles.textContainer}>
                            <Text style={styles.buttonText}>Usuń konto</Text>
                        </View>
                        <View style={styles.arrow}>
                            <Icon name="chevron-right" size={30}/>
                        </View>
                    </View>
                </TouchableOpacity>
            </View> 
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex:1,
        backgroundColor: "#f5f5f5",
    },
    buttonContainer: {
        marginTop: 20,
        marginHorizontal: 10,
    },
    button: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        height: 50,
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    buttonText:{
        color: "black",
        fontFamily: "OpenSans_400Regular"
    },
});

export default AccountUserScreen;