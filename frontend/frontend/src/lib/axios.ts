import axios from "axios";



export const axiosIntance = axios.create({
    baseURL:"http://13.233.255.160:5000/api/v1",
    withCredentials:true
});