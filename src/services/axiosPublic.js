import axios from 'axios';

const BASE_URL = "http://160.191.49.99:7777/api/v0";

const axiosPublic = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosPublic;