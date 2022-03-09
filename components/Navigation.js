import * as React from 'react';
import {useState, useEffect} from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

/* START SCREENS */
import LoginScreen from '../StartScreens/LoginScreen'
import ForgotPasswordScreen from '../StartScreens/ForgotPasswordScreen';
import RegisterScreen from '../StartScreens/RegisterScreen';

/* USER SCREENS */
import HotelListScreen from '../UserScreens/HotelListScreen';
import AccountUserScreen from '../UserScreens/AccountUserScreen';
import AddPetScreen from '../UserScreens/AddPetScreen';
import EditPetScreen from '../UserScreens/EditPetScreen';
import BookingScreen from '../UserScreens/BookingScreen';
import FavouriteHotelsScreen from '../UserScreens/FavouriteHotelsScreen';
import HotelDetailsScreen from '../UserScreens/HotelDetailsScreen';
import ListOfPetsScreen from '../UserScreens/ListOfPetsScreen';
import ReservationListScreen from '../UserScreens/ReservationListScreen';
import HistoryOfReservationsScreen from  '../UserScreens/HistoryOfReservationsScreen'

/* OWNER SCREENS */
import NotificationScreen from '../OwnerHotelScreens/NotificationScreen';
import HistoryOfNotificationScreen from '../OwnerHotelScreens/HistoryOfNotificationScreen';
import AccountOwnerScreen from '../OwnerHotelScreens/AccountOwnerScreen';
import AddDayOffScreen from '../OwnerHotelScreens/AddDayOffScreen';
import DaysOffScreen from '../OwnerHotelScreens/DaysOffScreen';
import MyHotelsScreen from '../OwnerHotelScreens/MyHotelsScreen';

/* ADDITIONAL COMPONENTS */
import SearchHeader from './SearchHeader';
import { AuthContext } from '../storage/loginContext';
import axiosInstance from '../services/axiosInstanceConfig'; 
import deleteSecureStore from '../services/deleteSecureStore';
import saveDataInSS from '../services/saveDataInSS';
import getAnimalTypesFromAPI from '../services/getAnimalTypesFromAPI'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Navigation = props => {

    const Tab = createBottomTabNavigator();
    const Stack = createNativeStackNavigator();

    const [state, dispatch] = React.useReducer(
        (prevState, action) => {
          switch (action.type) {
            case 'SIGN_IN':
              return {
                ...prevState,
                isLogged: true,
                token: action.token,
                authority: action.authority,
              };
            case 'SIGN_OUT':
                return {
                  ...prevState,
                  isLogged: false,
                  token: null,
                  authority: null,
            };
          }
        },
        {
          isLogged: false,
          token: null,
          authority: null,
        }
      );

    useEffect(() => {
        // Fetch the token from storage then navigate to our appropriate place
        const checkIfTokenExist = async () => {
          let userToken;
          let userAuthority;
    
          try {
            userToken = await SecureStore.getItemAsync('token');
            userAuthority = await SecureStore.getItemAsync('authority');
          } catch (e) {
            // Restoring token failed
          }
          
          //  VALIDATE TOKEN ?
          dispatch({ type: 'SIGN_IN', token: userToken, authority: userAuthority });
        };

        getAnimalTypesFromAPI().then(async(data) => { /* save types in async storage */
            try {    
                const animalTypes = JSON.stringify(data)
                await AsyncStorage.setItem('animalTypes', animalTypes)
            } 
            catch (e) {    // saving error
                console.log(e)
            }    
        })
        checkIfTokenExist()
    }, []);
    const authContext = React.useMemo(
    () => ({
        signIn: async (data) => {

            axiosInstance.post('/api/mobileLogin', data).then( res => {
                if (res.data !== '' && res.data.constructor === Object) { //succesful login
                    saveDataInSS('token', res.data.token);
                    saveDataInSS('username', data.username);
                    saveDataInSS('password', data.password);
                    saveDataInSS('authority', res.data.authority);

                    dispatch({ type: 'SIGN_IN', token: res.data.token, authority: res.data.authority }) 
                }
                else{
                    alert("Niepoprawny login lub hasło!")
                }
            })
        },
        signOut: async() => {
                    deleteSecureStore('token');
                    deleteSecureStore('username');
                    deleteSecureStore('password');
                    deleteSecureStore('authority');
                    dispatch({ type: 'SIGN_OUT' })
        },
    }),
    []
  );

    const MainUserViewStack = () => {
        return (
            <Stack.Navigator initialRouteName="HotelList">
                <Stack.Screen name="HotelList" component={HotelListScreen} options={{ header: (props) => <SearchHeader {...props}/>}}/>
                <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Złóż rezerwacje' }}/>
                <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} options={{ title: 'Szczegóły hotelu' }}/>
            </Stack.Navigator>
        );
    }
    const FavouriteHotelsStack = () => {
            return (
                <Stack.Navigator initialRouteName="HotelList">
                    <Stack.Screen name="FavouriteHotels" component={FavouriteHotelsScreen} options={{ title: "Ulubione hotele" }}/>
                    <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} options={{ title: 'Szczegóły hotelu' }}/>
                    <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Złóż rezerwacje' }}/>
                </Stack.Navigator>
            );
    }
    const AccountUserStack = () => {
        return (
            <Stack.Navigator initialRouteName="AccountUser">
                <Stack.Screen name="AccountUser" component={AccountUserScreen} options={{ title: 'Konto' }}/>
                <Stack.Screen name="AddPet" component={AddPetScreen} options={{ title: 'Dodawanie zwierzęcia' }}/>
                <Stack.Screen name="EditPet" component={EditPetScreen} options={{ title: 'Edytowanie zwierzęcia' }}/>
                <Stack.Screen name="ListOfPets" component={ListOfPetsScreen} options={{ title: 'Lista zwierząt' }}/>
            </Stack.Navigator>
        );
    }
    const DaysOffStack = () => {
        return (
            <Stack.Navigator initialRouteName="DaysOff">
                <Stack.Screen name="DaysOff" component={DaysOffScreen} options={{ title: 'Dni wolne' }}/>
                <Stack.Screen name="AddDayOff" component={AddDayOffScreen} options={{ title: 'Dodaj dzień wolny' }}/>
            </Stack.Navigator>
        );
    }
    const NotificationStack = () => {
        return (
            <Stack.Navigator initialRouteName="NotificationTab">
                <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ title: 'Notyfikacje' }}/>
                <Stack.Screen name="NotificationHistory" component={HistoryOfNotificationScreen} options={{ title: 'Historia rezerwacji' }}/>
            </Stack.Navigator>
        );
    }
    const ReservationStack = () => {
        return (
            <Stack.Navigator initialRouteName="ReservationListScreen">
                <Stack.Screen name="ReservationListScreen" component={ReservationListScreen} options={{ title: 'Rezerwacje' }}/>
                <Stack.Screen name="ReservationHistory" component={HistoryOfReservationsScreen} options={{ title: 'Historia rezerwacji' }}/>
            </Stack.Navigator>
        );
    }
    const MyHotelsStack = () => {
        return (
            <Stack.Navigator initialRouteName="MyHotels">
                <Stack.Screen name="HotelDetails" component={HotelDetailsScreen} options={{title: 'Podgląd hotelu'}}/>
                <Stack.Screen name="MyHotels" component={MyHotelsScreen} options={{ title: 'Moje hotele' }}/>
            </Stack.Navigator>
        );
    }


    const chooseNav = (token, authority) => {

        if(token){
            switch(authority) {
                case "ROLE_USER":
                return (
                    <Tab.Navigator initialRouteName="HotelListTab"
                        screenOptions={({ route }) => ({
                            tabBarIcon: ({ color }) => {
                            const icons = {
                                HotelListTab: 'home-variant',
                                AccountUserTab: 'account-cog',
                                FavouriteHotelsTab: 'heart',
                                ReservationListTab: 'calendar-month'
                            };

                            return (
                                <Icon
                                name={icons[route.name]}
                                color={color}
                                size={30}
                                />
                            );
                            },
                            tabBarShowLabel: false,
                            tabBarActiveTintColor: "red",
                            tabBarInactiveTintColor: "black",

                            tabBarStyle: {
                                height: "10%",
                                display: getFocusedRouteNameFromRoute(route) === "HotelDetails" ? "none" : "flex",
                            },
                        })
                    }
                    >
                    <Tab.Screen name="HotelListTab" component={MainUserViewStack} options={{title: 'Lista hoteli', headerShown: false }}/>
                    <Tab.Screen name="FavouriteHotelsTab" component={FavouriteHotelsStack} options={{title: 'Ulubione hotele', headerShown: false}}/>
                    <Tab.Screen name="ReservationListTab" component={ReservationStack} options={{title: 'Rezerwacje', headerShown: false}}/>
                    <Tab.Screen name="AccountUserTab" component={AccountUserStack} options={{title: 'Konto', headerShown: false }}/>
                  </Tab.Navigator>
                )
                case "ROLE_OWNER":
                return (
                    <Tab.Navigator initialRouteName="NotificationTab" 
                        screenOptions={({ route, navigation }) => ({
                            tabBarIcon: ({ color }) => {
                            const icons = {
                                NotificationTab: 'bell',
                                DaysOffTab: 'calendar-month',
                                MyHotelsTab: 'office-building',
                                AccountOwnerTab: 'account-cog'
                            };

                            return (
                                <Icon
                                name={icons[route.name]}
                                color={color}
                                size={30}
                                />
                            );
                            }, 
                            tabBarShowLabel: false,
                            tabBarActiveTintColor: "red",
                            tabBarInactiveTintColor: "black",
                            tabBarStyle: {
                                height: "10%",
                                display: getFocusedRouteNameFromRoute(route) === "HotelDetails" ? "none" : "flex",
                            },
                        })
                    }
                    >
                      <Tab.Screen name="NotificationTab" component={NotificationStack} options={{ title: 'Notyfikacje', headerShown: false }}/>
                      <Tab.Screen name="DaysOffTab" component={DaysOffStack} options={{ title: 'Dni wolne', headerShown: false }}/>
                      <Tab.Screen name="MyHotelsTab" component={MyHotelsStack} options={{ title: 'Moje hotele', headerShown: false }}/>
                      <Tab.Screen name="AccountOwnerTab" component={AccountOwnerScreen} options={{ title: 'Konto' }}/>
                    </Tab.Navigator>
                )
              }
        }
        else{
            return (
                <Stack.Navigator initialRouteName="Login">
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: '' }}/>
                        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '' }}/>
                </Stack.Navigator>
            )
        }
    }

    return (
        <AuthContext.Provider value={authContext}>
            <NavigationContainer>
                    {chooseNav(state.token, state.authority)}
            </NavigationContainer>
        </AuthContext.Provider>
    );
};

const styles = StyleSheet.create({
 icons:{
     flex: 1,
     color: "red",
     },
});

export default Navigation;