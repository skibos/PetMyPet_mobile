import React, {useEffect, useState} from 'react';
import { 
    View, 
    Modal, 
    Text,
    StyleSheet, 
    Dimensions, 
    TouchableOpacity,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native';
import addReview from '../services/addReview'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Linking} from 'react-native';
import getAnimalTypes from '../storage/getAnimalTypes'
import getReviewByUsernameAndHotelId from '../services/getReviewByUsernameAndHotelId'
import IconFontAwesome from 'react-native-vector-icons/Ionicons';
import { Rating } from 'react-native-ratings';

const CustomModal = (props) => {
    const [type, setType] = useState("")
    const [review, setReview] = useState(0)
    const [swipingReview, setSwipingReview] = useState(0)

    useEffect(() => {
        if(props.isOwner){
            getAnimalTypes().then(el => setType(el[props.item.animal.animalType]));
        }
        if(!props.isOwner && props.isHistory){
            getReviewByUsernameAndHotelId(props.item.hotel.id).then((rev) => {rev && setReview(rev)})
        }
    },[])

    return (
        <Modal 
            animationType={"slide"}
            visible={props.visible}
            transparent={true}
        >
                <View style={styles.mainContainer}>
                    <TouchableWithoutFeedback onPress={() => {props.onClickOutside()}}>
                        <View style={props.isOwner && !props.isHistory ? styles.modalWrapperOwner : styles.modalWrapperUser}/>
                    </TouchableWithoutFeedback>
                    <View style={styles.modalContainer}>
                        <View style={props.isOwner && !props.isHistory ? styles.informationContainer : [styles.informationContainer, {paddingBottom: "7%"}]}>
                            <View style={{paddingVertical: 10, flexDirection: "row", justifyContent: "space-between"}}>
                                <Text style={styles.informationHotelName}>{props.item.hotel.name}</Text>
                                <TouchableWithoutFeedback onPress={() => {props.onClickOutside()}}>
                                    <Icon name="close" size={28} color="black" />
                                </TouchableWithoutFeedback>
                            </View>
                            <Text style={styles.informationDatePrice}>{props.item.checkIn} -  {props.item.checkOut} | Cena: {props.priceOfReservation} zł</Text>
                            {props.isOwner ?
                            <Text style={styles.informationDatePrice}>Typ: {type}</Text>
                            :
                            <Text style={styles.informationDatePrice}>Imię zwierzaka: {props.item.animal.name}</Text>
                            }
                        </View>
                            {props.isOwner ? 

                                props.isHistory ? 
                                    <View style={styles.buttonsContainer}>
                                        <View style={styles.singleButtonContainer}>
                                            <TouchableOpacity onPress={() => {
                                                Linking.openURL(`tel:${props.item.ownerPhoneNumber}`)
                                            }}>
                                                <View style={styles.singleButtonInside}>
                                                    <Text style={styles.buttonText}>Skontaktuj się z rezerwującym</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={[styles.singleButtonContainer]}>
                                            <TouchableOpacity onPress={() => props.onCancelReservation()}>
                                                <View style={styles.singleButtonInside}>
                                                    <Text style={[styles.buttonText, {color: "red"}]}>Usuń rezerwację</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                :
                                <View style={ props.isOwner ? [styles.buttonsContainer, {flex:2}]: styles.buttonsContainer}>
                                    <View style={styles.singleButtonContainer}>
                                        <TouchableOpacity onPress={() => {
                                            Linking.openURL(`tel:${props.item.ownerPhoneNumber}`)
                                        }}>
                                            <View style={styles.singleButtonInside}>
                                                <Text style={styles.buttonText}>Skontaktuj się z rezerwującym</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.singleButtonContainer]}>
                                        <TouchableOpacity onPress={() => props.showInformation()}>
                                            <View style={styles.singleButtonInside}>
                                                <Text style={styles.buttonText}>{"Pokaż więcej informacji o zwierzaku"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.singleButtonContainer]}>
                                        <TouchableOpacity onPress={() => props.onCancelReservation()}>
                                            <View style={styles.singleButtonInside}>
                                                <Text style={[styles.buttonText, {color: "red"}]}>{"Odrzuć rezerwację"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={[styles.singleButtonContainer]}>
                                        <TouchableOpacity onPress={() => props.onAcceptReservation()}>
                                            <View style={styles.singleButtonInside}>
                                                <Text style={[styles.buttonText, {color: "green"}]}>{"Zaakceptuj rezerwację"}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            :
                            props.isHistory ? 
                            <View style={styles.buttonsContainer}>
                                <View style={styles.singleButtonContainer}>
                                    {review != 0 ? 
                                    <View style={[styles.singleButtonInside, {flexDirection: "row"}]}>
                                        <Text style={[styles.buttonText, {color:"#F1CA03"}]}>Twoja ocena hotelu: {review}</Text>
                                        <View style={styles.centerIcon}><IconFontAwesome name={"star"}  size={15} color="#F1CA03"/></View>
                                    </View>
                                    :
                                
                                    props.item.status != "R" ?
                                    <View style={[styles.singleButtonInside, styles.centerIcon, {flexDirection: "row", justifyContent: "space-between"}]}>
                                        <Text>
                                            Oceń: {swipingReview}
                                        </Text>
                                        <Rating
                                            type='star'
                                            ratingCount={5} 
                                            fractions={0}
                                            minValue={1}
                                            startingValue={0}
                                            imageSize={40}
                                            onSwipeRating={(num) => setSwipingReview(num)}
                                            onFinishRating={(num) => {
                                                setReview(num)
                                                addReview(props.item.hotel.id, num)
                                            }}
                                        />
                                    </View>
                                    :
                                    <View style={styles.singleButtonContainer}>
                                        <TouchableOpacity onPress={() => {
                                            Linking.openURL(`tel:${props.item.hotel.phoneNumber}`)
                                        }}>
                                            <View style={styles.singleButtonInside}>
                                                <Text style={styles.buttonText}>Skontaktuj się z hotelem</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    }
                                </View>
                                <View style={styles.singleButtonContainer}>
                                    <TouchableOpacity onPress={() => props.onCancelReservation()}>
                                        <View style={styles.singleButtonInside}>
                                            <Text style={[styles.buttonText, {color: "red"}]}>{props.isHistory ? "Usuń rezerwację": "Anuluj rezerwację"}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            :
                            <View style={styles.buttonsContainer}>
                                <View style={styles.singleButtonContainer}>
                                    <TouchableOpacity onPress={() => {
                                        Linking.openURL(`tel:${props.item.hotel.phoneNumber}`)
                                    }}>
                                        <View style={styles.singleButtonInside}>
                                            <Text style={styles.buttonText}>Skontaktuj się z hotelem</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={[styles.singleButtonContainer]}>
                                    <TouchableOpacity onPress={() => props.onCancelReservation()}>
                                        <View style={styles.singleButtonInside}>
                                            <Text style={[styles.buttonText, {color: "red"}]}>{props.isHistory ? "Usuń rezerwację": "Anuluj rezerwację"}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            }

                        
                    </View>
                </View>
            
        </Modal>
    );
}

const styles = StyleSheet.create({
    mainContainer: { 
        flex: 1 
    },
    modalWrapperUser: {
        flex:2,
        backgroundColor: 'rgba(52, 52, 52, 0.5)',
    },
    modalWrapperOwner: {
        flex:1,
        backgroundColor: 'rgba(52, 52, 52, 0.5)',
    },
    modalContainer: {  
        flex:1,
        backgroundColor: "white",
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    informationContainer: {
        flex:1,
        borderBottomWidth: 1,
        borderColor: "grey",
    },
    informationHotelName:{
        fontSize: 20,
        fontFamily: "OpenSans_700Bold",
    },
    informationDatePrice:{
        fontFamily: "OpenSans_400Regular",
        color: "grey"
    },
    buttonsContainer: {
        flex: 2,
        flexDirection:"column"
    },
    singleButtonContainer:{
        flex:1,
        justifyContent: "center",
        alignItems: "stretch",
    },
    singleButtonInside:{
        paddingHorizontal: 10,
    }, 
    centerIcon:{
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontFamily: "OpenSans_400Regular",
    }
});


export default CustomModal;