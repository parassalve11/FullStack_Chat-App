import axios from "axios";



export const axiosIntance = axios.create({
    baseURL:`http://${process.env.NEXT_PUBLIC_USER_SERVICE}/api/v1`,
    withCredentials:true
});