import React, { useState } from "react";
import "./CSS/Loginsignup.css";

const Loginsignup = () => {

    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const login = async () => {
        console.log("login executed", formData);
        
        let responseData;
        await fetch('http://localhost:4000/login', {
            method: "POST",
            headers:{
                Accept: "application/form-data",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        }).then((res) => res.json()).then((data) => responseData = data);

        if(responseData.success){
            localStorage.setItem('auth-token', responseData.token);
            window.location.replace("/");
        }
        else{
            alert(responseData.error);
        }
    }

    const signup = async () => {
        console.log("signup executed", formData);

        let responseData;
        await fetch('http://localhost:4000/signup', {
            method: "POST",
            headers:{
                Accept: "application/form-data",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        }).then((res) => res.json()).then((data) => responseData = data);

        if(responseData.success){
            localStorage.setItem('auth-token', responseData.token);
            window.location.replace("/");
        }
        else{
            alert(responseData.error);
        }
    }

    const changHandler = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    return (
        <div className="loginsignup">
            <div className = "loginsignup-container">
                <h1>{state}</h1>
                <div className="loginsignup-fields">
                    {state === "Sign Up"?<input onChange={changHandler} value={formData.name} name="name" type="text" placeholder="Your Name"/>: <></>}
                    <input onChange={changHandler} value={formData.email} name="email" type="email" placeholder="Email Address"/>
                    <input onChange={changHandler} name="password" value={formData.password} type="password" placeholder="Password"/>
                </div>
                <div className="loginsignup-agree">
                    <input type="checkbox" name="" id="" />
                    <p>By continuing, I agree to the terms of use and privacy policy</p>
                </div>
                <button onClick={() => {state==="Login"?login():signup()}}>{state}</button>
                {state === "Sign Up"
                ?<p className="loginsignup-login">Already have an account? <span onClick={() => {setState("Login")}}>Login here</span></p>
                :<p className="loginsignup-login">Create an account!<span onClick={() => {setState("Sign Up")}}>Click here</span></p>
                }
            </div>
        </div>
    )
}

export default Loginsignup;