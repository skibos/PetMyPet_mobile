import axiosInstance from '../services/axiosInstanceConfig'; 

const getFilteredHotels = async(location, km, dateFrom, dateTo, typeOfPet, currentPage) => {
    
    var response = axiosInstance.post('/api/hotelsFilter', 
        {
            "location": location,
            "range": km,
            "startingDate": dateFrom,
            "endingDate": dateTo,
            "animalType": typeOfPet
        },
        {
            params:{
                "page": currentPage
            }
        }
    )
    .then(function (response) {
        return response.data;
    })
    .catch(function (error) {
        console.log(error)
        // if (error.response) {
        //     // The request was made and the server responded with a status code
        //     // that falls out of the range of 2xx
        //     console.log(error.response.data);
        //     console.log(error.response.status);
        //     console.log(error.response.headers);
        // } else if (error.request) {
        //     // The request was made but no response was received
        //     // `error.request` is an instance of XMLHttpRequest in the 
        //     // browser and an instance of
        //     // http.ClientRequest in node.js
        //     console.log(error.request);
        // } else {
        //     // Something happened in setting up the request that triggered an Error
        //     console.log('Error', error.message);
        // }
    });
    
    return response;
}

export default getFilteredHotels;
