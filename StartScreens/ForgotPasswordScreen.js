import React, {useState} from 'react';
import { View, Text, StyleSheet, TextInput, TouchableHighlight} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState();

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.headerText}>PRZYPOMNIJ HASŁO</Text>
            </View>
            <View style={styles.formSection}>
                <View style={styles.iconAndInput}>
                    <Icon name="account" size={40}/>
                    <TextInput
                        style={styles.input}
                        placeholder="Wpisz email"
                        value={email}
                        onChangeText={setEmail}
                     />
                </View>
                <TouchableHighlight>
                        <View style={styles.forgotButton}>
                            <Text>Odzyskaj hasło</Text>
                        </View>
                </TouchableHighlight> 
            </View>
            <View style={styles.waterMark}>
                <Icon name="lock-reset" size={180} color="rgba(0,0,0,0.5)"/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    header: {
        flex: 1,
        marginLeft: "10%",
        marginRight: "10%",
        justifyContent: "center"
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
        paddingBottom: 10,
    },
    input:{
        height: 40,
        width: "80%",
        borderWidth: 1,
        padding: 10,
    },
    forgotButton: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#DDD",
        height: 40,
        marginTop: 10,
    },
    waterMark: {
        flex: 6,
        alignItems: "center",
    },
});

export default ForgotPasswordScreen;