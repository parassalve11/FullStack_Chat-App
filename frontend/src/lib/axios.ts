import axios from "axios";



export const axiosIntance = axios.create({
    baseURL:"http://3.109.157.137:5000/api/v1",
    withCredentials:true
});