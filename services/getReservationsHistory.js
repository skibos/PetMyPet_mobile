import React, { useState} from 'react';
import axiosInstance  from '../services/axiosInstanceConfig';
import * as SecureStore from 'expo-secure-store';

export default async function getReservationsHistory() {

        const username = await SecureStore.getItemAsync('username')/* put getusernameandpass when will be fixed */
        const token = await SecureStore.getItemAsync('token')

        return axiosInstance.get('/api/userFinishedReservations/' + username,
        {
            headers: {
                Cookie: "PetMyPetJWT=" + token,
            },
        }
        )
        .then(function (response) {
            return response.data.reverse();
        })
        .catch(function (error) {
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
        });

}
