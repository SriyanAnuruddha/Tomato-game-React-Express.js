import React, { useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import axios from "axios";

export default function AuthProvider({ children }) {
    const [authUser, setAuthUser] = useState({})
    const [authType, setAuthType] = useState(0) // 0 = logout(not authenticated), 1 =  already login, 2 = new login , 3 = sign up


    const unAuthorizedUser = {
        username: '',
        email: '',
        isAuthenticated: false
    }

    // check if user already have the token
    useEffect(() => {
       
        (async ()=>{
            try{          
                const response = await axios.get('/api/users/authenticate',{
                    headers:{
                        'Authorization': `Bearer ${localStorage.getItem("accessToken")}`
                    }
                })

                if(response.status ===200){
                    setAuthUser(response.data)
                    setAuthType(1)
                }

            }catch(error){
                setAuthUser(unAuthorizedUser)
                console.log('user is not registerd')
            }
        })()
    }, [])



    // Set user data when they login
    const login = (user) => {
        setAuthUser(user)
    }

    // Reset user data when they logout
    const logout = () => {
        setAuthUser(unAuthorizedUser)
        localStorage.removeItem("accessToken")
    }

    // Set auth type
    const changeAuthType = (type) => {
        setAuthType(type)
    }

    return (
        <AuthContext.Provider value={{ authUser, login, logout, authType, changeAuthType }}>
            {children}
        </AuthContext.Provider>
    )
}

