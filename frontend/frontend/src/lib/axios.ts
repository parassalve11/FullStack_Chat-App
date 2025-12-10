import axios from "axios";



export const axiosIntance = axios.create({
    baseURL:"http://43.204.231.232:5000/api/v1",
    withCredentials:true
});