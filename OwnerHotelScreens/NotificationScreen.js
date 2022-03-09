import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableWithoutFeedback } from 'react-native';
import CollapsibleView from "@eliav2/react-native-collapsible-view";
import axiosInstance  from '../services/axiosInstanceConfig';
import * as SecureStore from 'expo-secure-store';
import EmptyList from '../components/EmptyList'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NotificationScreen = ({navigation}) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        getDataNotificationFromApi()
    }, [])
  
  async function getDataNotificationFromApi() {
          const username = await SecureStore.getItemAsync('username')/* put getusernameandpass when will be fixed */
          const token = await SecureStore.getItemAsync('token')

          axiosInstance.get('/api/ownerReservations/' + username,
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
  
  var statusNotification = "W"
  const rejectNotification = (item) => {
    statusNotification = "R"
    saveNotification(item)
  }
  const acceptNotification = (item) => {
    statusNotification = "A"
    saveNotification(item)
  }

  async function saveNotification(item) {
    const token = await SecureStore.getItemAsync('token')
    axiosInstance.patch('/api/patchReservation', {
      id      : item.id,
      hotelId : item.hotel.id,
      animalId: item.animal.id,
      checkIn : item.checkIn,
      checkOut: item.checkOut,
      status  : statusNotification
    },
    {
        headers:{
            Cookie: "PetMyPetJWT=" + token,
        }
    }
    )
    .catch(function (error) {
        console.log('There has been a problem with your fetch operation: ' + error.message);
        // ADD THIS THROW error
        throw error;
    })
  }

  const SingleNotification = ({ item }) => (
    <CollapsibleView title={
      <View style={styles.singleElement}>
          <View style={styles.nameOfHotel}>
              <Text style={{color: "black"}}>{item.hotel.name}</Text>
          </View>
          <View style={styles.buttons}>
            <Icon name="checkbox-marked" size={45} color="green" onPress={() => {
                acceptNotification(item)
                setData(data.filter(({id}) => id != item.id))
              }
            }/>
            <Icon name="close-box" size={45} color="red" onPress={() => {
                rejectNotification(item)
                setData(data.filter(({id}) => id != item.id))
              }
            }/>
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

  const HistoryButton = () => (
    <TouchableWithoutFeedback onPress={() => {navigation.navigate('NotificationHistory')}}>
        <View style={styles.historyButtonOutside}>
            <Text>Historia rezerwacji</Text>
        </View>
    </TouchableWithoutFeedback>
  );    

  const renderPet = ({ item }) => (
      <SingleNotification
        item={item}
      />
    );

    return (
        <View style={styles.screen}>
          <FlatList
            data={data}
            renderItem={renderPet}
            keyExtractor={(item) => item.id}
            ListFooterComponent={<HistoryButton/>}
            ListFooterComponentStyle={styles.historyButton}
            contentContainerStyle={styles.flatListStyle}
            ListEmptyComponent={<EmptyList message="Brak nowych notyfikacji!"/>}
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
    flex:5,
    padding: 5,
    justifyContent: "center"
  },
  buttons: {
    flex:2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  textIn: {
    fontSize: 16,
    padding: 10,
  },
  historyButton: {
    flex:1, 
    justifyContent: 'flex-end'
  },
  historyButtonOutside: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "orange",
    height: 40,
    marginTop: 10,
    marginBottom: 10,
  },
  flatListStyle: {
    flexGrow: 1,
  },
});

export default NotificationScreen;