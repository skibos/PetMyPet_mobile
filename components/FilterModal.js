import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import Modal from "react-native-modal";
import { useNavigation } from '@react-navigation/native';

const FilterModal = (props) => {
    const navigation = useNavigation();
    
    return(
        <View>
            <Modal isVisible={props.visible} style={styles.filter}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 9 }}>
                        <Text>Tu beda filtry</Text>
                    </View>
                    <View style={styles.hideFilterButtonContainer}>
                        <TouchableWithoutFeedback onPress={() => {
                            navigation.setParams({
                                filter: false,
                            });
                        }}>
                            <View style={styles.hideFilterButton}>
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
    filter:{
        flex:1,
        backgroundColor: "lightgrey",
    },
    hideFilterButton:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "orange",
        height: 40,
    },
    hideFilterButtonContainer:{
        flex:1,
        justifyContent: "flex-end",
        padding: 10,
    }
})

export default FilterModal;