import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://ip:port',
    withCredentials: true,
    timeout: 1000
});

export default instance;