import axios from "axios";



export const axiosIntance = axios.create({
    baseURL:"http://13.127.119.218:5000/api/v1",
    withCredentials:true
});