import { useState, useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import AuthContext from '../context/AuthContext';
import Alert from 'react-bootstrap/Alert';
import { useForm } from 'react-hook-form'
import axios from 'axios'

export default function Login() {
    const { login, changeAuthType } = useContext(AuthContext)
    const { register, handleSubmit, formState:{errors}} = useForm()

    const onSubmit = async (formData)=>{

        try{
            const response = await axios.post('/api/users/login',formData,{headers:{
                "Content-Type": "application/json"
            }})

            if(response.status ===200){
                const { userData, access_token } = response.data
                login(userData)
                changeAuthType(2)

                localStorage.setItem("accessToken",access_token)
            }
    
        }catch(error){
            console.error(error.message)
        }

    }

    return (
        <Form className='p-2' onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="LoginformBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text" 
                    placeholder="Enter Username"
                    {...register('username',{required:true})}
                />
                { errors?.username?.type == "required" && <Alert variant="danger" className='my-1 p-1'>"Username is requried!"</Alert>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="LoginformBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                    type="password"
                    placeholder="Password" 
                    {...register('password',{required:true})}
                />
                { errors?.password?.type == "required" && <Alert variant="danger" className='my-1 p-1'>"Username is requried!"</Alert>}
            </Form.Group>

            <Button type="submit" variant="primary" className='w-100'>
                Login
            </Button>

        </Form>
    )
}