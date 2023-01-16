import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Button, Text, FlatList, TouchableWithoutFeedback, Image, Alert } from 'react-native';
import EmptyList from '../components/EmptyList';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getImage from "../services/getImage"
import HalfModal from '../components/halfModal';
import axiosInstance  from '../services/axiosInstanceConfig';
import getNotificationHistory from '../services/getNofiticationsHistory'
import patchNotification from '../services/patchReservation'
import getAnimalTypes from '../storage/getAnimalTypes'
import deleteReservation from '../services/deleteReservation';
import getDatesBetween from '../services/getDatesBetween';

const HistoryOfNotificationScreen = ({navigation}) => {
    const [historyNotifications, setHistoryNotifications] = useState([]);
    const [modalVisible, setModalVisible] = useState(false)
    const [priceOfReservation, setPriceOfReservation] = useState()
    const [item, setItem] = useState()
    const [types, setTypes] = useState()

    useEffect(() => { /* after each load this screen, get notification and save it to array */
        const unsubscribe = navigation.addListener('focus', () => {
          getNotificationHistory().then(async(data) => {
            if(data !== null && data !== undefined){
                data.forEach(async(reservation) => {
                    var arr = []
                    arr = await getImage(reservation.hotel.id);
                    if(arr !== null && arr !== undefined){
                        arr = arr.map(el => axiosInstance.defaults.baseURL + "/images/getResizedImageByPath/" + el + "/?width=100&height=100");
                        reservation.hotel.image = arr[0];
                    }
                    if(!historyNotifications.some(el => el.id == reservation.id)){
                        setHistoryNotifications(prevState => [reservation, ...prevState]);
                    }
                })
            }
            else{
                setHistoryNotifications([])
            }
          })
        });
    
        return unsubscribe;
    }, [navigation, historyNotifications]);

    useEffect(() => {
        getAnimalTypes().then(el => setTypes(el));
    },[])

    const getStyleStatus = (status) => {
      switch (status) {
          case "A":
              return (
                  {
                      color: "green",
                  }
              );
          case "R":
              return (
                  {
                      color: "red",
                  }
              );
      }
  }

  const statusText = (status) => {
      switch (status) {
          case "A":
              return (
                  <Text>Zaakceptowano</Text>
              );
          case "R":
              return (
                  <Text>Odrzucono</Text>
              );
      }
  }

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
                  <Text style={[styles.informationStatus, getStyleStatus(item.status)]}>{statusText(item.status)}</Text>
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

  const renderNotification = ({ item }) => (
      <SingleNotification
        item={item}
      />
    );

    return (
        <View style={styles.screen}>
          <FlatList
            data={historyNotifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.flatListStyle}
            ListEmptyComponent={<EmptyList message="Brak histori!"/>}
          />
          { modalVisible &&
                <HalfModal 
                    visible={modalVisible}
                    item={item}
                    priceOfReservation={priceOfReservation}
                    isHistory={true}
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
                                    deleteReservation(item.id)
                                    setHistoryNotifications(historyNotifications.filter((el) => el.id != item.id));
                                } },
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

export default HistoryOfNotificationScreen;