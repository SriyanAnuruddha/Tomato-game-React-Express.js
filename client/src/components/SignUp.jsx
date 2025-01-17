import { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import AuthContext from '../context/AuthContext'
import Alert from 'react-bootstrap/Alert';
import { useForm } from 'react-hook-form'
import { API_Request } from '../utils/APIRequest';

export default function SingUp() {
    const { login, changeAuthType } = useContext(AuthContext)

    const { watch,register,handleSubmit,formState:{errors}} = useForm()

    const onSubmit = async (formData)=>{

        try{
            const response = await API_Request.post('users/register',formData)

            if(response.status ===200){
                const {userData,access_token} =response.data
                login(userData)
                changeAuthType(3)
                localStorage.setItem("accessToken",access_token)
            }
    
        }catch(error){
            console.error(error.message)
        }
    
    }


    return (
        <Form onSubmit={handleSubmit(onSubmit)} className='p-2'>
            
            <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control {...register('username',{required:true})} type="text" placeholder="Enter Username" />
                { errors?.username?.type == "required" && <Alert variant="danger" className='my-1 p-1'>"Username is requried!"</Alert>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email Addres</Form.Label>
                <Form.Control {...register('email',{required:true})} type="email" placeholder="Email" />
                { errors?.email?.type == "required" && <Alert variant="danger" className='my-1 p-1'>"email is requried!"</Alert>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control {...register('password',{required:true})} type="password" placeholder="Password" />
                { errors?.password?.type == "required" && <Alert variant="danger" className='my-1 p-1'>"password is requried!"</Alert>}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control 
                    {...register('confirmPassword',{required:"confirm passowrd is required!",validate:(value)=>{
                        if(watch('password') !== value){
                            return "passowrds don't match!"
                        }
                    }})} 
                     type="password" 
                    placeholder="Password" 
                 />
                { errors?.confirmPassword && <Alert variant="danger" className='my-1 p-1'>{errors?.confirmPassword?.message}</Alert>}
            </Form.Group>

            <Button variant="primary" type="submit" className='w-100'>
                Sign Up
            </Button>
        </Form>
    )
}