import React, {useState} from 'react';
import { View, Text, StyleSheet, Button, TextInput, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchHeader = ({navigation}) => {
    return (
        <SafeAreaView edges={['right', 'top', 'left']}>
            <View style={styles.container}>
                <View style={styles.searchInput}>
                    <TextInput
                            style={styles.input}
                            placeholder="Szukaj..."
                    />
                </View>
                <View style={styles.filtersAndSort}>
                    <TouchableWithoutFeedback onPress={() => {
                        navigation.setParams({
                            filter: true,
                        });
                    }}>
                        <View style={styles.filters}>
                            <Text>Filtry</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={() => {
                        navigation.setParams({
                            sort: true,
                        });
                    }}>
                        <View style={styles.sort}>
                            <Text>Sortuj</Text>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",

    },
    searchInput: {
        width: "90%"
    },
    input:{
        height: 40,
        padding: 10,
        backgroundColor: "lightgrey"
    },
    filtersAndSort: {
        flexDirection: "row",
        padding: 10,
        width: "90%",
        justifyContent: "space-between"
    },
    filters: {

    },
    sort: {

    }
});

export default SearchHeader;