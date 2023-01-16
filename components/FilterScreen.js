import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity,TouchableHighlight, TouchableWithoutFeedback, Modal, ScrollView} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import getAnimalTypes from '../storage/getAnimalTypes';
import getAnimalTypesFromAPI from '../services/getAnimalTypesFromAPI';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import TextField from '../components/TextField';
import getUserAccountDetails from '../services/getUserAccountDetails';
import * as Yup from "yup";
import { Formik } from "formik";
import AsyncStorage from '@react-native-async-storage/async-storage';

const FilterScreen = (props) => {

    const { colors } = useTheme();

    const navigation = useNavigation();
    const [userData, setUserData] = useState({});
    const [location, setLocation] = useState("");
    const [km, setKm] = useState();
    const [dateFromInInput, setDateFromInInput] = useState(false);
    const [dateToInInput, setDateToInInput] = useState(false);
    const [dateFrom, setDateFrom] = useState(new Date());
    const [dateTo, setDateTo] = useState(new Date());
    const [showDate, setShowDate] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [typeOfPet, setTypeOfPet] = useState();
    const [animalTypes, setAnimalTypes] = useState([]);

    const onChangeDateFrom = (event, selectedDate) => {
        const currentDate = selectedDate || dateFrom;
        if(Platform.OS === "android")
            setShowDate(0);
        setDateFrom(currentDate);
        setDateFromInInput(true);

        if(dateTo < currentDate){
            setDateTo(currentDate);
        }
    };

    const onChangeDateTo = (event, selectedDate) => {
        const currentDate = selectedDate || dateTo;
        if(Platform.OS === "android")
            setShowDate(0);
        setDateTo(currentDate);
        setDateToInInput(true);
      };

    const showDatepicker = (arg) => {
        setShowDate(arg);
    };

    useEffect(() => {
        var isMounted = true;


                getAnimalTypesFromAPI().then(async(data) => { /* save types in async storage */
                    try {    
                        const animalTypes = JSON.stringify(data)
                        await AsyncStorage.setItem('animalTypes', animalTypes)
                        getAnimalTypes().then(res => {
            
                            let types = [];
                            let singleType = {};
                            Object.entries(res).forEach(entry => { // foreach using values of object
                                const [key, value] = entry;
                                singleType = {
                                    label  : value.charAt(0).toUpperCase() + value.slice(1), // first letter upperCase - np. Kot
                                    value  : key // np. 1
                                }
                                types.push(singleType);
                            })
                            setAnimalTypes(types);
                        })
                    } 
                    catch (e) {    // saving error
                        console.log(e)
                    }    
                })

        return () => { isMounted = false };
    }, []);

    useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        if(props.route.params?.isLogged){
            getUserAccountDetails().then(res => setUserData(res));
        }
    });        
    return unsubscribe;
    }, [navigation]);
    

    const validationSchema = Yup.object({
        location: Yup.string()
            .required('Uzupełnij lokalizację'),
        range: Yup.string()
            .required("Uzupełnij zasięg"),
        startingDate: Yup.string()
            .required('Uzupełnij datę początku pobytu'),
        endingDate: Yup.string()
            .required("Uzupełnij końca pobytu"),
        animalType: Yup.string()
            .required("Uzupełnij typ zwierzęcia"),
    })

    return(
        <ScrollView>
            <View style={styles.filter}>
                    <View style={styles.formSection}>
                    <Formik
                    validationSchema={validationSchema}
                    validateOnChange={false}
                    initialValues={{
                        location: '',
                        range: '',
                        startingDate: '',
                        endingDate: '',
                        animalType: '',
                    }}
                    onSubmit ={
                        async(values, {resetForm}) => {
                            console.log(values)
                            navigation.navigate(!props.route.params?.isLogged ? "HotelListLoggedOut" : "HotelListLogged", {
                                location: values.location,
                                km: values.range,
                                dateFrom: values.startingDate,
                                dateTo: values.endingDate,
                                typeOfPet: values.animalType
                            });

                            resetForm();
                            setLocation("")
                            setKm("")
                            setDateFromInInput(false)
                            setDateToInInput(false)
                            setTypeOfPet("")
                        }
                    }
                >
                {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    setFieldValue,
                    values,
                    errors,
                    isValid,
                }) => (
                    <>
                        <View style={{paddingVertical: 10, alignItems: "center", justifyContent: "center"}}>
                            <Text style={[styles.saveButtonText, {fontSize: 20}]}>Witaj {props.route.params?.isLogged && userData.firstName}</Text>
                            <Text style={[styles.saveButtonText, {fontSize: 20}]}>Wyszukaj hotel dla swojego pupila</Text>
                        </View>
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={styles.input}
                                    label="Lokalizacja"
                                    labelTop="Lokalizacja"
                                    value={values.location}
                                    onChangeText={handleChange('location')}
                                    />
                            </View>
                            {errors.location &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.location}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => {
                                        setFieldValue("range", value)
                                        setKm(value)
                                    }}
                                    items={[
                                        {
                                            label: '+5km',
                                            value: 5,
                                        },
                                        {
                                            label: '+10km',
                                            value: 10,
                                        },
                                        {
                                            label: '+15km',
                                            value: 15,
                                        },
                                        {
                                            label: '+20km',
                                            value: 20,
                                        },
                                        {
                                            label: '+30km',
                                            value: 30,
                                        },
                                        {
                                            label: '+40km',
                                            value: 40,
                                        },
                                        {
                                            label: '+50km',
                                            value: 50,
                                        },
                                        {
                                            label: '+100km',
                                            value: 100,
                                        },
                                    ]}
                                    useNativeAndroidPickerStyle={false}
                                    style={{
                                        ...pickerSelectStyles,
                                        iconContainer: {
                                            top: 20,
                                            right: 20,
                                        },
                                    }}
                                    placeholder={{
                                        label: 'Km od lokalizacji',
                                        value: '',
                                    }}
                                    Icon={() => {
                                        return <Icon name="arrow-down" size={24} />;
                                    }}
                                    value={values.range}
                                />
                            </View>
                            {errors.range &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.range}</Text>
                            }
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={[styles.input, {color: "black"}]}
                                    label="Wybierz od kiedy"
                                    labelTop="Od kiedy"
                                    isData={true}
                                    showData={() => {
                                        showDatepicker(1);
                                        setModalVisible(true);
                                    }}
                                    value={dateFromInInput ? dateFrom.toISOString().split('T')[0] : null}
                                />
                            </View>
                            {errors.startingDate &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.startingDate}</Text>
                            }
                            {showDate == 1 && (Platform.OS === "ios" ? (
                                <Modal
                                    visible={modalVisible}
                                >
                                    <DateTimePicker
                                        value={dateFrom}
                                        mode="date"
                                        display="spinner"
                                        onChange={(event, selectedDate) => {
                                            onChangeDateFrom(event, selectedDate)
                                            if( selectedDate !== undefined){
                                                setFieldValue("startingDate", selectedDate.toISOString().split('T')[0])
                                            }
                                            else{
                                                setFieldValue("startingDate", new Date().toISOString().split('T')[0])
                                            }
                                        }}
                                        themeVariant="light"
                                        style={{ flex: 1 }}
                                    />
                                    <View style={styles.saveButtonContainer}>
                                        <TouchableOpacity onPress={() => {
                                            setModalVisible(!modalVisible)
                                            setShowDate(0)
                                            setDateFromInInput(true);
                                        }}>
                                                <View style={[styles.saveButton, {backgroundColor: colors.primary, marginBottom: 100}]}>
                                                    <Text style={styles.saveButtonText}>Zatwierdz date</Text>
                                                </View>
                                        </TouchableOpacity>
                                    </View>
                                </Modal> ) : (
                                <DateTimePicker
                                value={dateFrom}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    onChangeDateFrom(event, selectedDate)
                                    if( selectedDate !== undefined){
                                        setFieldValue("startingDate", selectedDate.toISOString().split('T')[0])
                                    }
                                    else{
                                        setFieldValue("startingDate", new Date().toISOString().split('T')[0])
                                    }
                                }}                      
                                />
                            ))}
                            <View style={styles.inputContainer}>
                                <TextField
                                    style={[styles.input, {color: "black"}]}
                                    label="Wybierz do kiedy"
                                    labelTop="Do kiedy"
                                    isData={true}
                                    showData={() => {
                                        showDatepicker(2);
                                        setModalVisible(true);
                                    }}
                                    value={dateToInInput ? dateTo.toISOString().split('T')[0] : null}
                                />
                            </View>
                            {errors.endingDate &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.endingDate}</Text>
                            }
                            {showDate == 2 && (Platform.OS === "ios" ? (
                            <Modal
                                visible={modalVisible}
                            >
                                            <DateTimePicker
                                            value={dateTo}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, selectedDate) => {
                                                onChangeDateTo(event, selectedDate)
                                                if( selectedDate !== undefined){
                                                    setFieldValue("endingDate", selectedDate.toISOString().split('T')[0])
                                                }
                                                else{
                                                    setFieldValue("endingDate", new Date().toISOString().split('T')[0])
                                                }
                                            }}
                                            style={{ flex: 1 }}
                                            themeVariant="light"
                                            minimumDate={dateFrom}
                                        />
                                    <View style={styles.saveButtonContainer}>
                                        <TouchableOpacity onPress={() => {
                                                setModalVisible(!modalVisible)
                                                setShowDate(0)
                                                setDateToInInput(true)
                                        }}>
                                                <View style={[styles.saveButton, {backgroundColor: colors.primary, marginBottom: 100}]}>
                                                    <Text style={styles.saveButtonText}>Zatwierdz date</Text>
                                                </View>
                                        </TouchableOpacity>
                                    </View>
                                    </Modal> ) : (
                                    <DateTimePicker
                                    value={dateTo}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        onChangeDateTo(event, selectedDate)
                                        if( selectedDate !== undefined){
                                            setFieldValue("endingDate", selectedDate.toISOString().split('T')[0])
                                        }
                                        else{
                                            setFieldValue("endingDate", new Date().toISOString().split('T')[0])
                                        }
                                    }}
                                    minimumDate={dateFrom}
                                    />
                                ))}
                            <View style={styles.inputContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => {
                                        setTypeOfPet(value)
                                        setFieldValue("animalType", value)
                                    }}
                                    items={animalTypes}
                                    useNativeAndroidPickerStyle={false}
                                    style={{
                                        ...pickerSelectStyles,
                                        iconContainer: {
                                        top: 20,
                                        right: 20,
                                        },
                                    }}
                                    placeholder={{
                                        label: 'Typ zwierzaka',
                                        value: '',
                                    }}
                                    Icon={() => {
                                        return <Icon name="arrow-down" size={24} />;
                                    }}
                                    value={values.animalType}
                                />
                            </View>
                            {errors.animalType &&
                                <Text style={{ fontSize: 10, color: 'red' }}>{errors.animalType}</Text>
                            }
                        
                        <View style={[styles.hideFilterButtonContainer, !props.route.params?.isLogged ? {marginBottom: "20%"} : {marginBottom: "10%"}]}>
                            <TouchableOpacity onPress={handleSubmit}>
                                <View style={[styles.hideFilterButton, {backgroundColor: colors.primary}]}>
                                    <Text style={styles.saveButtonText}>Wyszukaj hotele</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        </>
                    )}
                    </Formik>
                    </View>
                </View>
            </ScrollView>
    );
}
const styles = StyleSheet.create({
    filter:{
        flex:1,
        backgroundColor: "white",
    },
    header:{

    },
    formSection: {
        flex:1,
        marginTop: "5%",
        marginHorizontal: "5%",
        flexDirection: "column",
    },
    inputContainer: {
        paddingVertical: 10,
    },
    input:{
        height: 65,
        padding: 10,
        backgroundColor:"#f0f0f0",
        borderRadius: 8,
    },
    inputData:{
        height: 65,
        backgroundColor:"#f0f0f0",
        borderRadius: 8,
    },
    inputContainerData: {

        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    inputCalendarContainer:{
        flex:3,
    },
    calendarIcon:{
        flex:1,
        justifyContent: "center",
        alignItems: "center",
    },
    hideFilterButton:{
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderRadius: 20,
    },
    hideFilterButtonContainer:{
        flex:1,
        justifyContent: "flex-end",
        marginHorizontal: "30%",
    },
    saveButtonContainer:{
        marginTop: 15,
        marginBottom: 20,
        marginHorizontal: "30%",
    },
    saveButton: {
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderRadius: 20,
    },
    regularFontFamily:{
        color: "black",
        fontFamily: "OpenSans_400Regular",
    },
    saveButtonText:{
        fontFamily: "OpenSans_600SemiBold"
    },
})
const pickerSelectStyles = StyleSheet.create({
    placeholder: {
        color: "grey",
    },
    inputIOS: {
      fontSize: 14,
      fontFamily: "OpenSans_400Regular",
      padding: 10,
      height: 65,
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
      backgroundColor:"#f0f0f0",
    },
    inputAndroid: {
      fontSize: 14,
      fontFamily: "OpenSans_400Regular",
      padding: 10,
      height: 65,
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
      backgroundColor:"#f0f0f0",
    },
  });
export default FilterScreen;