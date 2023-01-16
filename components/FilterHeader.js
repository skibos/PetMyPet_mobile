import React, {useState} from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FilterHeader = (props) => {
    const { colors } = useTheme();
    
    return (
        <SafeAreaView edges={['top']} style={{backgroundColor: colors.primary}}>
            <View style={!props.route.params?.isLogged ? styles.container : styles.containerLogin}>
                <View style={styles.logoContainer}>
                  <Image 
                      source={require('../assets/logo_header.png')}
                      style={{flex:1 , width: 130}}
                  />
                </View>
                {!props.route.params?.isLogged &&
                    <View style={styles.loginContainer}>
                        <TouchableOpacity onPress={() => {
                            props.navigation.navigate("Login");
                        }}>
                                <View style={[styles.loginButton, {backgroundColor: colors.primary}]}>
                                    <Icon name="account" size={25} color="black"/>
                                </View>
                        </TouchableOpacity>
                    </View>
                }
            </View>
            <View style={{backgroundColor: colors.primary, height: 10}}/>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: "5%",
        paddingVertical: 10,
        backgroundColor: "white",
    },
    containerLogin: {
        justifyContent: "center",
        alignItems: "stretch",
        paddingVertical: 10,
        backgroundColor: "white",
    },
    filterButton: {
        paddingHorizontal:20,
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderRadius: 20,
    },
    logoContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 40,
    },
    loginButton: {
        paddingHorizontal:10,
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderRadius: 20,
    },
    buttonText:{
        fontFamily: "OpenSans_600SemiBold"
    }
});

export default FilterHeader;