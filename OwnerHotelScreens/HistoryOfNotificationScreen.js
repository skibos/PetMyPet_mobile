import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableWithoutFeedback } from 'react-native';
import CollapsibleView from "@eliav2/react-native-collapsible-view";
import axiosInstance  from '../services/axiosInstanceConfig';
import * as SecureStore from 'expo-secure-store';
import EmptyList from '../components/EmptyList';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HistoryOfNotificationScreen = ({navigation}) => {
    const [data, setData] = useState([]);

    useEffect(() => { /* after each load this screen, get notification and save it to array */
        const unsubscribe = navigation.addListener('focus', () => {
            setData([]);
            getDataNotificationFromApi();
        });
    
        return unsubscribe;
    }, [navigation]);

  
  async function getDataNotificationFromApi() {
          const username = await SecureStore.getItemAsync('username')/* put getusernameandpass when will be fixed */
          const token = await SecureStore.getItemAsync('token')

          axiosInstance.get('/api/ownerFinishedReservations/' + username,
          {
              headers: {
                  Cookie: "PetMyPetJWT=" + token,
              },
          },
              { withCredentials: true }
          )
          .then((response) => {
              setData(response.data.reverse());
          })
          .catch(function(error) {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the 
                // browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
          })
  }

  const SingleNotification = ({ item }) => (
    <CollapsibleView title={
      <View style={styles.singleElement}>
          <View style={styles.nameOfHotel}>
              <Text style={{color: "black"}}>{item.hotel.name}</Text>
          </View>
          <View style={styles.status}>
            {item.status == "A" ? /*if status is accepted , otherwise rejected */
                <Icon name="checkbox-marked" size={45} color="green"/>
                :
                <Icon name="close-box" size={45} color="red"/>
            }
          </View>
      </View>
    }>
      <Text style={styles.textIn}>{item.checkIn} - {item.checkOut}</Text>
      <CollapsibleView title={
        <View style={styles.singleElement}>
          <Text>{item.animal.animaltype}: {item.animal.name}</Text>
        </View>
      }>
        <Text>
          waga: {item.animal.weight}{"\n"}
          szczepienia: {item.animal.vaccinations ? <Text>Tak</Text> : <Text>Nie</Text>}{"\n"}
          szczegóły: {item.animal.notes}
        </Text>
      </CollapsibleView>
    </CollapsibleView>
);

  const renderNotification = ({ item }) => (
      <SingleNotification
        item={item}
      />
    );

    return (
        <View style={styles.screen}>
          <FlatList
            data={data}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.flatListStyle}
            ListEmptyComponent={<EmptyList message="Brak histori!"/>}
          />
        </View>
    );
};

const styles = StyleSheet.create({
  screen: {
      flex: 1,
  },
  singleElement: {
    flex:1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  nameOfHotel:{
    flex:6,
    padding: 5,
    justifyContent: "center"
  },
  status: {
    flex:1,
    justifyContent: "center",
    alignItems: "stretch"
  },
  textIn: {
    fontSize: 16,
    padding: 10,
  },
  flatListStyle:{
    flexGrow: 1,
  }
  });

export default HistoryOfNotificationScreen;