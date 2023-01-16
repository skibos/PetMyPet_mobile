import * as React from 'react';
import {useState, useEffect, useCallback} from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Font from 'expo-font';
import {
    useFonts,
    OpenSans_300Light,
    OpenSans_400Regular,
    OpenSans_500Medium,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    OpenSans_800ExtraBold,
    OpenSans_300Light_Italic,
    OpenSans_400Regular_Italic,
    OpenSans_500Medium_Italic,
    OpenSans_600SemiBold_Italic,
    OpenSans_700Bold_Italic,
    OpenSans_800ExtraBold_Italic,
  } from '@expo-google-fonts/open-sans';

/* START SCREENS */
import LoginScreen from '../StartScreens/LoginScreen'
import ForgotPasswordScreen from '../StartScreens/ForgotPasswordScreen';
import RegisterOwnerScreen from '../StartScreens/RegisterOwnerScreen';
import RegisterUserScreen from '../StartScreens/RegisterUserScreen';

/* USER SCREENS */
import HotelListScreen from '../UserScreens/HotelListScreen';
import AccountUserScreen from '../UserScreens/AccountUserScreen';
import EditAccountDataUserScreen from '../UserScreens/EditAccountDataUserScreen';
import AddPetScreen from '../UserScreens/AddPetScreen';
import EditPetScreen from '../UserScreens/EditPetScreen';
import BookingScreen from '../UserScreens/BookingScreen';
import FavouriteHotelsScreen from '../UserScreens/FavouriteHotelsScreen';
import HotelDetailsScreen from '../UserScreens/HotelDetailsScreen';
import ListOfPetsScreen from '../UserScreens/ListOfPetsScreen';
import ReservationListScreen from '../UserScreens/ReservationListScreen';
import HistoryOfReservationsScreen from  '../UserScreens/HistoryOfReservationsScreen';

/* OWNER SCREENS */
import NotificationScreen from '../OwnerHotelScreens/NotificationScreen';
import HistoryOfNotificationScreen from '../OwnerHotelScreens/HistoryOfNotificationScreen';
import AccountOwnerScreen from '../OwnerHotelScreens/AccountOwnerScreen';
import EditAccountDataOwnerScreen from '../OwnerHotelScreens/EditAccountDataOwnerScreen';
import AddDayOffScreen from '../OwnerHotelScreens/AddDayOffScreen';
import DaysOffScreen from '../OwnerHotelScreens/DaysOffScreen';
import MyHotelsScreen from '../OwnerHotelScreens/MyHotelsScreen';
import EditHotelScreen from '../OwnerHotelScreens/EditHotelScreen';

/* ADDITIONAL COMPONENTS */
import FilterHeader from './FilterHeader';
import FilterScreen from './FilterScreen';
import { AuthContext } from '../storage/loginContext';
import axiosInstance from '../services/axiosInstanceConfig'; 
import deleteSecureStore from '../services/deleteSecureStore';
import saveDataInSS from '../services/saveDataInSS';
import getAnimalTypesFromAPI from '../services/getAnimalTypesFromAPI'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import resendActivationEmail from '../services/resendActivationEmail';

const Navigation = props => {
    const [appIsReady, setAppIsReady] = useState(false);
    
    const Tab = createBottomTabNavigator();
    const Stack = createNativeStackNavigator();
    const TopTab = createMaterialTopTabNavigator();

    const MyTheme = {
        dark: false,
        colors: {
          primary: 'rgb(173, 148, 109)',
          background: 'rgb(255, 255, 255)',
          card: 'rgb(255, 255, 255)',
          text: 'rgb(0, 0, 0)',
          border: 'rgb(98, 80, 51)',
          notification: 'rgb(71, 56, 32)',
        },
    };

    const Fonts = {
        OpenSans_300Light,
        OpenSans_400Regular,
        OpenSans_500Medium,
        OpenSans_600SemiBold,
        OpenSans_700Bold,
        OpenSans_800ExtraBold,
        OpenSans_300Light_Italic,
        OpenSans_400Regular_Italic,
        OpenSans_500Medium_Italic,
        OpenSans_600SemiBold_Italic,
        OpenSans_700Bold_Italic,
        OpenSans_800ExtraBold_Italic,
    };

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
                  token: action.token,
                  authority: action.authority,
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
          let usernameFromSS;
          let passwordFromSS;
    
          try { /* if we logged before, try get token and authority from ss */
            userToken = await SecureStore.getItemAsync('token');
            userAuthority = await SecureStore.getItemAsync('authority');
            usernameFromSS = await SecureStore.getItemAsync('username');
            passwordFromSS = await SecureStore.getItemAsync('password');
            
                if(userToken && userAuthority){ /* generate new token because older could expire  */
                var data = {
                    username: usernameFromSS,
                    password: passwordFromSS
                }
                axiosInstance.post('/api/mobileLogin', data).then( res => {
                    saveDataInSS('token', res.data.token);
                    saveDataInSS('authority', res.data.authority);
                    
                    dispatch({ type: 'SIGN_IN', token: res.data.token, authority: res.data.authority })
                })
            }
          } catch (e) {
            // Restoring token failed
          }
        };

        async function prepare() {
            try {

                await SplashScreen.preventAutoHideAsync(); // Keep the splash screen visible while we fetch resources

                // Pre-load fonts, make any API calls you need to do here
                
                checkIfTokenExist()
                await Font.loadAsync(Fonts); 
                await new Promise(resolve => setTimeout(resolve, 1500));

            } catch (e) {
              console.warn(e);

            } finally {
                // Tell the application to render
                setAppIsReady(true);
            }
          }
      prepare();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
          // This tells the splash screen to hide immediately! If we call this after
          // `setAppIsReady`, then we may see a blank screen while the app is
          // loading its initial state and rendering its first pixels. So instead,
          // we hide the splash screen once we know the root view has already
          // performed layout.
          await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    const authContext = React.useMemo(
    () => ({
        signIn: async (data) => {
            axiosInstance.post('/api/mobileLogin', data).then( res => {
                if(res.data.token != null){ //check if account active
                    saveDataInSS('token', res.data.token);
                    saveDataInSS('username', data.username);
                    saveDataInSS('password', data.password);
                    saveDataInSS('authority', res.data.authority);
                    
                    dispatch({ type: 'SIGN_IN', token: res.data.token, authority: res.data.authority })
                }
                else{
                    Alert.alert(
                        '',
                        'Konto nie jest aktywne. Kliknij w link aktywacyjny, który został wysłany na pocztę. Możesz ponownie wysłać link aktywacyjny klikając Wyślij.',
                        [
                            { text: "Wyślij", onPress: () => {
                                resendActivationEmail(data.username)
                            }},
                            { text: "Zamknij", style: "cancel" },
                        ]
                    )
                }
            }).
            catch((er) => {
                console.log(er)
                alert("Niepoprawny login lub hasło!")
            })
        },
        signOut: () => {
            dispatch({ type: 'SIGN_OUT', token: null, authority: null })
            deleteSecureStore('token');
            deleteSecureStore('username');
            deleteSecureStore('password');
            deleteSecureStore('authority');
        },
    }),
    []
  );

    const MainUserViewStack = () => {
        return (
            <Stack.Navigator initialRouteName="FiltersLogged">
                <Stack.Screen name="HotelListLogged" component={HotelListScreen} initialParams={{isLogged: state.isLogged}} options={{ title: 'Lista hoteli' }}/>
                <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Złóż rezerwacje' }}/>
                <Stack.Screen name="HotelDetailsLogged" component={HotelDetailsScreen}   options={{ title: 'Szczegóły hotelu' }}/>
                <Stack.Screen name="FiltersLogged" component={FilterScreen} initialParams={{isLogged: state.isLogged}} options={{ header: (props) => <FilterHeader {...props}/>}}/>
            </Stack.Navigator>
        );
    }
    const FavouriteHotelsStack = () => {
            return (
                <Stack.Navigator initialRouteName="FavouriteHotels">
                    <Stack.Screen name="FavouriteHotels" component={FavouriteHotelsScreen} initialParams={{isLogged: state.isLogged}} options={{ title: "Ulubione hotele" }}/>
                    <Stack.Screen name="HotelDetailsFromFavourite" component={HotelDetailsScreen} options={{ title: 'Szczegóły hotelu' }}/>
                    <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Złóż rezerwacje' }}/>
                </Stack.Navigator>
            );
    }
    const AccountUserStack = () => {
        return (
            <Stack.Navigator initialRouteName="AccountUser">
                <Stack.Screen name="AccountUser" component={AccountUserScreen} options={{ title: 'Ustawienia konta' }}/>
                <Stack.Screen name="EditAccountUser" component={EditAccountDataUserScreen}  options={{ title: 'Edytuj konto'}}/>
                <Stack.Screen name="ListOfPetsTab" component={ListOfPetsTabs} options={{ title: 'Zarządzaj zwierzętami'}}/>
            </Stack.Navigator>
        );
    }
    const AccountOwnerStack = () => {
        return (
            <Stack.Navigator initialRouteName="AccountOwner">
                <Stack.Screen name="AccountOwner" component={AccountOwnerScreen} options={{ title: 'Ustawienia konta' }}/>
                <Stack.Screen name="EditAccountOwner" component={EditAccountDataOwnerScreen} options={{ title: 'Edytuj konto' }}/>
            </Stack.Navigator>
        );
    }
    const NotificationTab = () => {
        return (
            <TopTab.Navigator initialRouteName="NotificationTab">
                <TopTab.Screen name="NotificationScreen" component={NotificationScreen} options={{ title: 'Oczekujące' }}/>
                <TopTab.Screen name="NotificationHistory" component={HistoryOfNotificationScreen} options={{ title: 'Zakończone' }}/>
            </TopTab.Navigator>
        );
    }
    const ReservationTab = () => {
        return (
            <TopTab.Navigator initialRouteName="ReservationListScreen">
                <TopTab.Screen name="ReservationListScreen" component={ReservationListScreen} options={{ title: 'Oczekujące' }}/>
                <TopTab.Screen name="ReservationStack" component={HistoryOfReservationsScreen} options={{ title: 'Zakończone' }}/>
            </TopTab.Navigator>
        );
    }

    const MyHotelsStack = () => {
        return (
            <Stack.Navigator initialRouteName="MyHotels">
                <Stack.Screen name="HotelDetailsOwner" component={HotelDetailsScreen}  options={{title: 'Podgląd hotelu'}}/>
                <Stack.Screen name="MyHotels" component={MyHotelsScreen} initialParams={{isLogged: state.isLogged}} options={{ title: 'Moje hotele' }}/>
                <Stack.Screen name="EditHotelTab" component={EditHotelTab} options={{ title: '', headerShow: false }}/>
            </Stack.Navigator>
        );
    }

    const EditHotelTab = () => {
        return (
            <TopTab.Navigator initialRouteName="EditHotel">
                <TopTab.Screen name="EditHotel" component={EditHotelScreen} options={{ title: 'Edytuj informacje o hotelu' }}/>
                <TopTab.Screen name="DaysOffScreen" component={DaysOffScreen} options={{ title: 'Dni wolne' }}/>
                <TopTab.Screen name="AddDayOff" component={AddDayOffScreen} options={{ title: 'Dodaj dzień wolny' }}/>
            </TopTab.Navigator>
        );
    }

    const RegisterTabs = () => {
        return (
            <TopTab.Navigator initialRouteName="RegisterUser">
                <TopTab.Screen name="RegisterUser" component={RegisterUserScreen} options={{title: 'Właściciel zwierzaka'}}/>
                <TopTab.Screen name="RegisterOwner" component={RegisterOwnerScreen} options={{ title: 'właściciel hotelu' }}/>
            </TopTab.Navigator>
        );
    }

    const ListOfPetsTabs = () => {
        return (
            <TopTab.Navigator initialRouteName="ListOfPetsStack">
                <TopTab.Screen name="ListOfPetsStack" component={ListOfPetsStack} options={{ title: 'Lista zwierząt', headerShown: false }}/>
                <TopTab.Screen name="AddPet" component={AddPetScreen} options={{ title: 'Dodawanie zwierzęcia' }}/>
            </TopTab.Navigator>
        );
    }

    const ListOfPetsStack = () => {
        return (
            <Stack.Navigator initialRouteName="ListOfPets">
                <Stack.Screen name="ListOfPets" component={ListOfPetsScreen} options={{ title: 'Lista zwierząt', headerShown: false }}/>
                <Stack.Screen name="EditPet" component={EditPetScreen} options={{ title: 'Edytowanie zwierzęcia', headerShown: false }}/>
            </Stack.Navigator>
        );
    }

    

    const chooseNav = (token, authority) => {

        if(token){
            switch(authority) {
                case "ROLE_USER":
                return (
                    <Tab.Navigator initialRouteName="HotelListTabLoggedIn"
                        screenOptions={({ route }) => ({
                            tabBarIcon: ({ color }) => {
                            const icons = {
                                HotelListTabLoggedIn: 'home-variant',
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
                            tabBarActiveTintColor: MyTheme.colors.notification,
                            tabBarInactiveTintColor: MyTheme.colors.primary,

                            tabBarStyle: {
                                height: "8%",
                                display: getFocusedRouteNameFromRoute(route) === "HotelDetailsLogged" || getFocusedRouteNameFromRoute(route) === "HotelDetailsFromFavourite" ? "none" : "flex",
                                borderTopColor: "lightgrey"
                            },
                        })
                    }
                    >
                    <Tab.Screen name="HotelListTabLoggedIn" component={MainUserViewStack} options={{title: 'Lista hoteli', headerShown: false }}/>
                    <Tab.Screen name="FavouriteHotelsTab" component={FavouriteHotelsStack} options={{title: 'Ulubione hotele', headerShown: false}}/>
                    <Tab.Screen name="ReservationListTab" component={ReservationTab} options={{title: 'Rezerwacje'}}/>
                    <Tab.Screen name="AccountUserTab" component={AccountUserStack} options={{title: 'Ustawienia konta', headerShown: false }}/>
                  </Tab.Navigator>
                )
                case "ROLE_OWNER":
                return (
                    <Tab.Navigator initialRouteName="NotificationTab" 
                        screenOptions={({ route }) => ({
                            tabBarIcon: ({ color }) => {
                            const icons = {
                                NotificationTab: 'bell',
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
                            tabBarActiveTintColor: MyTheme.colors.notification,
                            tabBarInactiveTintColor: MyTheme.colors.primary,
                            tabBarStyle: {
                                height: "8%",
                                display: getFocusedRouteNameFromRoute(route) === "HotelDetailsOwner" ? "none" : "flex",
                                borderTopColor: "lightgrey"
                            },
                        })
                    }
                    >
                      <Tab.Screen name="NotificationTab" component={NotificationTab} options={{ title: 'Notyfikacje'}}/>
                      <Tab.Screen name="MyHotelsTab" component={MyHotelsStack} options={{ title: 'Moje hotele', headerShown: false }}/>
                      <Tab.Screen name="AccountOwnerTab" component={AccountOwnerStack} options={{ title: 'Ustawienia konta', headerShown: false }}/>
                    </Tab.Navigator>
                )
              }
        }
        else{
            return (
                <Stack.Navigator initialRouteName="FiltersLoggedOut">
                    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Logowanie',headerShown: true, headerTransparent: true, headerShadowVisible: false }}/>
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Przypomnij hasło' }}/>
                    <Stack.Screen name="Register" component={RegisterTabs} options={{ title: 'Zarejestruj się' }}/>
                    <Stack.Screen name="HotelListLoggedOut" component={HotelListScreen} initialParams={{isLogged: state.isLogged}} options={{ title: 'Lista hoteli' }}/>
                    <Stack.Screen name="HotelDetailsLoggedOut" component={HotelDetailsScreen} options={{ title: 'Szczegóły hotelu' }}/>
                    <Stack.Screen name="FiltersLoggedOut" component={FilterScreen} initialParams={{isLogged: state.isLogged}} options={{ header: (props) => <FilterHeader {...props}/>}} />
                </Stack.Navigator>
            )
        }
    }

    if (!appIsReady) {
        return null;
    }

    return (
            <AuthContext.Provider value={authContext}>
                <NavigationContainer onReady={onLayoutRootView} theme={MyTheme}>
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