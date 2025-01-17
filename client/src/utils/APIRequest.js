import axios from "axios";

const API_Request = axios.create({
    baseURL:"http://localhost:5050/api/",
    timeout:2000,
    headers:{
        "Content-Type": "application/json",
    }
})

export {API_Request}