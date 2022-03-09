import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableWithoutFeedback} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import getHotels from '../services/getHotels';
import getFavourites from '../services/getFavourites';
import addFavourite from '../services/addFavourite'
import deleteFavourite from '../services/deleteFavourite'
import { useFocusEffect } from '@react-navigation/native';
import FilterModal from '../components/FilterModal';
import SortModal from '../components/SortModal';


const HotelListScreen = ({ route, navigation }) => {
    const [hotels, setHotels] = useState([])
    const [page, setpage] = useState(1);
    const [hasMore, sethasMore] = useState(true);
    const [fav, setFav] = useState([]); // array of favourites hotels 
    const [visibleFilter, setVisibleFilter] = useState(false);
    const [visibleSort, setVisibleSort] = useState(false);

    useEffect(() => { /* after first render, get 12 hotels */

        getHotels(page).then(all => { 
            setHotels(all)
        })

        setpage(page + 1);

    }, []);

    useEffect(() => {
        setVisibleFilter(route.params?.filter)
    }, [route.params?.filter]);

    useEffect(() => {
        setVisibleSort(route.params?.sort)
    }, [route.params?.sort]);

    useFocusEffect(
        React.useCallback(() => {
            setFav([]);
            
            getFavourites().then(favourites => {
                if(favourites !== undefined){
                    favourites.forEach(el => {
                        setFav(previousState => [el.id, ...previousState])
                    })
                }
            })
            
        }, [navigation])
    );

    const fetchData = async () => { /* called after reach end, get next 12 hotels if it is possible */
        if(hasMore){
            const newHotels = await getHotels(page);
            if (newHotels.length === 0) {
                sethasMore(false);
            }
            else{
                setHotels([...hotels, ...newHotels]);
                setpage(page + 1);
            }
        }
    };

    const SingleHotel = ({ item, navigation }) => {
    
        return(
        <TouchableWithoutFeedback onPress={() => navigation.navigate("HotelDetails", {
            id: item.id
        })}>
            <View style={styles.singleHotelContainer}>
                <View style={styles.imageContainer}>
                    <Text style={{color: "black"}}>{item.photo}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.upperPartOfInfo}>
                        <View style={styles.nameOfHotel}>
                            <Text style={{color: "black", flexShrink: 1}}>{item.name}</Text>
                        </View>
                        <View style={styles.ratingOfHotel}>
                            <Text>{item.hotelScores.score ? item.hotelScores.score : 0}</Text>
                            <Icon name="star" size={25} color="yellow"/>
                        </View>
                    </View>
                    <View style={styles.lowerPartOfInfo}>
                        <View style={styles.locationOfHotel}>
                            <Text style={{color: "black"}}>{item.city},</Text>
                            <Text style={{color: "black"}}>{item.street}</Text>
                        </View>
                        <View style={styles.heartIcon}>
                            <Icon name="heart" size={30} color={fav.includes(item.id) ? "red" : "#BC544B"} onPress={() => {
                                if(fav.some(el => el == item.id)){ // is favourite and delete from favourite
                                    deleteFavourite(item.id)
                                    setFav(fav.filter(el => el != item.id))
                                }
                                else{ // add to favourite
                                    addFavourite(item.id)
                                    setFav([item.id, ...fav])
                                }
                            }}/>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    
    )};

    const renderHotel = ({ item }) => (
            <SingleHotel
            item={item}
            navigation={navigation}
            />
      );
    return (
        <View style={styles.screen}>
            {visibleFilter && 
                <FilterModal visible={visibleFilter}/>
            }
            {visibleSort && 
                <SortModal visible={visibleSort}/>
            }
            <FlatList
                data={hotels}
                initialNumToRender={12}
                renderItem={renderHotel}
                keyExtractor={(item) => item.id}
                onEndReachedThreshold = {0.2}
                onEndReached = {fetchData}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    singleHotelContainer:{
        flex:1,
        height: 120,
        backgroundColor: "lightgrey",
        marginVertical: 5,
        flexDirection: "row"
    },
    imageContainer:{
        flex:1,
        backgroundColor: "green",
        height: 120
    },
    infoContainer:{
        flex:2,
        flexDirection: "column"
    },
    upperPartOfInfo:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        
    },
    lowerPartOfInfo:{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    nameOfHotel:{
        flex: 4,
        padding: 10,
    },
    ratingOfHotel:{
        flex: 1,
        paddingHorizontal: 10,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center"        
    },
    locationOfHotel:{
        padding: 10,
        justifyContent:"flex-end",
    },
    heartIcon:{
        padding: 10,
        justifyContent: "flex-end",
    },

});

export default HotelListScreen;