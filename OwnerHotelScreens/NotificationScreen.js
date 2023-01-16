import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableWithoutFeedback, Image, Alert } from 'react-native';
import getImage from "../services/getImage"
import HalfModal from '../components/halfModal';
import axiosInstance  from '../services/axiosInstanceConfig';
import * as SecureStore from 'expo-secure-store';
import EmptyList from '../components/EmptyList'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getNotification from '../services/getNotification'
import patchNotification from '../services/patchReservation'
import getAnimalTypes from '../storage/getAnimalTypes'
import getDatesBetween from '../services/getDatesBetween'

const NotificationScreen = ({navigation}) => {
    const [notifications, setNotifications] = useState([]);
    const [modalVisible, setModalVisible] = useState(false)
    const [priceOfReservation, setPriceOfReservation] = useState()
    const [item, setItem] = useState()
    const [types, setTypes] = useState()

    useEffect(() => {
        getAnimalTypes().then(el => setTypes(el));
    },[])

    useEffect(() => { /* after each load this screen, get notification and save it to array */
        const unsubscribe = navigation.addListener('focus', () => {
            getNotification().then(async(data) => {
                if(data !== null && data !== undefined){
                    data.forEach(async(reservation) => {
                        var arr = []
                        arr = await getImage(reservation.hotel.id);
                        if(arr !== null && arr !== undefined){
                            arr = arr.map(el => axiosInstance.defaults.baseURL + "/images/getResizedImageByPath/" + el + "/?width=100&height=100");
                            reservation.hotel.image = arr[0];
                        }
                        if(!notifications.some(el => el.id == reservation.id)){
                            setNotifications(prevState => [reservation, ...prevState]);
                        }
                    })
                }
                else{
                    setNotifications([])
                }
            })
        });
        
    return unsubscribe;
    }, [navigation, notifications]);
  

  const SingleNotification = ({ item }) => (
    <View style={styles.singleReservation}>
      <View style={styles.headerSingleReservationContainer}>
          <View></View>
          <Text style={styles.headerCityText}>{item.hotel.city}</Text>
          <Text style={styles.headerDateText}>{item.checkIn} - {item.checkOut}</Text>
      </View>
      <View style={styles.informationSingleReservationContainer}>
          <View style={styles.photoContainer}>
              <View style={styles.photo}>
                  <Image 
                      source={item.hotel.image ? {uri: item.hotel.image} : require('../assets/brakZdj.png')}
                      style={{flex:1 , width: "100%", height: "100%", aspectRatio: 1,borderRadius: 8}}
                  />
              </View>
          </View>
          <View style={styles.informations}>
                  <Text style={styles.informationHotelName}>{item.hotel.name}</Text>
              <View style={styles.paddingToText}>
                  <Text style={styles.informationDatePrice}>{item.checkIn} - {item.checkOut}</Text>
                  <Text style={styles.informationDatePrice}>Cena: {Number((getDatesBetween(new Date(item.checkIn), new Date(item.checkOut)).length*item.hotel.prices[item.animal.animalType]).toFixed(2))} zł</Text>
              </View>
              <View style={styles.paddingToText}>
                  <Text style={styles.informationStatus}>Oczekuje na potwierdzenie</Text>
              </View>
          </View>
          <View style={styles.button}>
              <TouchableWithoutFeedback onPress={() => {
                  setItem(item)
                  setPriceOfReservation(Number((getDatesBetween(new Date(item.checkIn), new Date(item.checkOut)).length*item.hotel.prices[item.animal.animalType]).toFixed(2)))
                  setModalVisible(true);
              }}>
                  <Icon name="dots-vertical" size={30} color="black"/>
              </TouchableWithoutFeedback>
          </View>
      </View>
    </View>
  );

  const renderPet = ({ item }) => (
      <SingleNotification
        item={item}
      />
    );

    return (
        <View style={styles.screen}>
          <FlatList
            data={notifications}
            renderItem={renderPet}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<EmptyList message="Brak nowych notyfikacji!"/>}
          />
              { modalVisible &&
                <HalfModal 
                    visible={modalVisible}
                    item={item}
                    priceOfReservation={priceOfReservation}
                    isHistory={false}
                    isOwner={true}
                    onClickOutside={() => {
                        setModalVisible(false)
                    }}
                    onCancelReservation={() => {
                        setModalVisible(false)
                        Alert.alert(
                            '',
                            'Czy na pewno chcesz odrzucić rezerwację?',
                            [
                                { text: "Nie", style: "cancel" },
                                { text: "Tak", onPress: () => {
                                    patchNotification(item, "R")
                                    setNotifications(notifications.filter((el) => el.id != item.id));
                                } },
                            ]
                        )
                    }}
                    onAcceptReservation={() => {
                      setModalVisible(false)
                      Alert.alert(
                          '',
                          'Czy na pewno chcesz akceptować rezerwację?',
                          [
                              { text: "Nie", style: "cancel" },
                              { text: "Tak", onPress: () => {
                                  patchNotification(item, "A")
                                  setNotifications(notifications.filter((el) => el.id != item.id));
                              } },
                          ]
                      )
                    }}
                    showInformation={() => {
                      var information = `Imię zwierzaka:  ${item.animal.name}\n`
                      information += `Typ zwierzaka: ${types[item.animal.animalType]}\n`
                      information += `Waga: ${item.animal.weight}\n`
                      information += `Data urodzenia: ${item.animal.birthDate}\n`
                      information += `Aktualne szczepienia:  ${item.animal.vaccinations ? "Tak" : "Nie"}\n`
                      information += `Opis / dodatkowe informacje: ${item.animal.notes}\n`
                      
                      Alert.alert(
                          '',
                          information,
                          [
                              { text: "Ok" },
                          ]
                      )
                    }}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
},
singleReservation: {
    flex:1,
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F5F5F5",
    
    flexDirection: "column",
},
headerSingleReservationContainer:{
    flex:1,
    flexDirection: "column",
    padding: 10,
    justifyContent: "flex-start",
    alignItems: "flex-start",
},
informationSingleReservationContainer:{
    flex:2,
    padding: 10,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 8,
    //backgroundColor: "blue"
},
photoContainer:{
    flex:2,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 15,
},
paddingToText:{
    marginTop: 5,
},
photo:{
    flex:1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
},
informations:{
    flex:6,
},
button:{
    flex:1,
    alignItems: "flex-end",
},
headerCityText:{
    fontSize: 16,
    fontFamily: "OpenSans_700Bold",
},
headerDateText:{
    fontFamily: "OpenSans_400Regular",
    color: "grey",
},
informationHotelName:{
    fontFamily: "OpenSans_600SemiBold",
},
informationDatePrice:{
    fontFamily: "OpenSans_400Regular",
},
informationStatus:{
    fontFamily: "OpenSans_400Regular",
    color: "#E0E629"
}

});

export default NotificationScreen;