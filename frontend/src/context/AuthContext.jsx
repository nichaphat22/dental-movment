import React, { useEffect, useState, useCallback, createContext } from 'react';
// import { postRequest, baseUrl } from '../utils/services';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [registerError, setRegisterError] = useState(null);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [registerInfo, setRegisterInfo] = useState({
        fname: "",
        lname: "",
        email: "",
        password: "",
    });
    const [loginError, setLoginError] = useState(null);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        const user = localStorage.getItem("User");
        if (user) {
            setUser(JSON.parse(user));
        }
    }, []);

    const updateRegisterInfo = useCallback((info) => {
        setRegisterInfo(info);
    }, []);

    const updateLoginInfo = useCallback((info) => {
        setLoginInfo(info);
    }, []);

    const registerUser = useCallback(async (e) => {
        e.preventDefault();
        setIsRegisterLoading(true);
        setRegisterError(null);

        try {
            const response = await axios.post(
                `http://localhost:8080/api/users/register`,
                registerInfo
            );

            setIsRegisterLoading(false);

            if (response.error) {
                setRegisterError(response);
                return;
            }

            localStorage.setItem("User", JSON.stringify(response));
            setUser(response);
        } catch (error) {
            setIsRegisterLoading(false);
            setRegisterError({ error: 'Something went wrong, please try again later.' });
        }
    }, [registerInfo]);

    const loginUser = useCallback(async (e) => { 
        e.preventDefault();
        setIsLoginLoading(true);
        setLoginError(null);
    
        try {
            const response = await axios.post(
                `http://localhost:8080/api/users/login`, 
                loginInfo // อย่าลืมตรวจสอบว่า loginInfo มีข้อมูลครบถ้วนไหม เช่น email และ password
            );
    
            if (response.data.error) { // ควรเช็ค response.data.error ไม่ใช่ response.error
                setLoginError(response.data.error);
                return;
            }
    
            localStorage.setItem("User", JSON.stringify(response.data)); // response.data น่าจะเป็นข้อมูลผู้ใช้
            setUser(response.data); // set user state
            setIsLoginLoading(false);
    
            console.log("Login Response:", response.data); // ตรวจสอบข้อมูลผู้ใช้
            createChat(response.data); // เรียกใช้ createChat หลังจากผู้ใช้ล็อกอินสำเร็จ
        } catch (error) {
            setIsLoginLoading(false);
            setLoginError({ error: 'Something went wrong, please try again later.' });
            console.error('Login error:', error); // เพิ่มการ log ข้อผิดพลาดเพื่อการดีบัก
        }
    }, [loginInfo]);
    
    

    const loginWithGoogle = async (googleUser) => {
        try {
            const response = await axios.post(`http://localhost:8080/api/users/google-login`, {
                tokenId: googleUser.tokenId,
            });
    
            if (response.error) {
                console.error('Google Login Failed:', response.error);
                return;
            }
    
            setUser(response);
            localStorage.setItem('User', JSON.stringify(response));
        } catch (error) {
            console.error('Something went wrong with Google Login:', error);
        }
    };

    const createChat = useCallback(async (user) => {
        try {
            const { roleRef, email, token } = user;
    
            const chatResponse = await axios.post(`http://localhost:8080/api/chats`, {
                email,
                roleRef,
                token,
            });
    
            console.log("Create Chat Response:", chatResponse);
    
           
            if (chatResponse.message === 'Chat already exists for student') {
                // แจ้งว่ามีแชทอยู่แล้ว
                console.log('Chat already exists');
            } else {
                // การสร้างแชทสำเร็จ
                console.log('Chats created:', chatResponse.chats);
            }
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    }, []);
    
    
    
    
    const logoutUser = useCallback(() => {
        localStorage.removeItem("User");
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                registerInfo,
                updateRegisterInfo,
                registerUser,
                registerError,
                isRegisterLoading,
                logoutUser,
                loginUser,
                loginError,
                loginInfo,
                updateLoginInfo,
                isLoginLoading,
                loginWithGoogle,
                createChat
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
