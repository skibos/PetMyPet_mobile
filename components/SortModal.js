import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import Modal from "react-native-modal";
import { useNavigation } from '@react-navigation/native';

const SortModal = (props) => {
    const navigation = useNavigation();
    
    return(
        <View>
            <Modal isVisible={props.visible} style={styles.sort}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 9 }}>
                        <Text>Tu beda sortowania</Text>
                    </View>
                    <View style={styles.hideSortButtonContainer}>
                        <TouchableWithoutFeedback onPress={() => {
                            navigation.setParams({
                                sort: false,
                            });
                        }}>
                            <View style={styles.hideSortButton}>
                                <Text>Schowaj</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
const styles = StyleSheet.create({
    sort:{
        flex:1,
        backgroundColor: "lightgrey",
    },
    hideSortButton:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
        height: 40,
    },
    hideSortButtonContainer:{
        flex:1,
        justifyContent: "flex-end",
        padding: 10,
    }
})

export default SortModal;