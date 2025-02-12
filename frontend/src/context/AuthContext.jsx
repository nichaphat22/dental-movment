import React, { useEffect, useState, useCallback, createContext } from "react";
import { postRequest, baseUrl } from "../utils/services";

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

  const registerUser = useCallback(
    async (e) => {
      e.preventDefault();
      setIsRegisterLoading(true);
      setRegisterError(null);

      try {
        const response = await postRequest(
          `${baseUrl}/users/register`,
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
        setRegisterError({
          error: "Something went wrong, please try again later.",
        });
      }
    },
    [registerInfo]
  );

  const loginUser = useCallback(async (e = null) => {
    if (e) e.preventDefault(); // ตรวจสอบว่า event มีอยู่หรือไม่
  
    setIsLoginLoading(true);
    setLoginError(null);
  
    try {
      const response = await postRequest(`${baseUrl}/users/login`, loginInfo);
  
      if (response.error) {
        setLoginError(response);
        setIsLoginLoading(false);
        return;
      }
  
      localStorage.setItem("User", JSON.stringify(response));
      setUser(response);
      setIsLoginLoading(false);
  
      return response; // คืนค่า user หลังจาก login สำเร็จ
    } catch (error) {
      setIsLoginLoading(false);
      setLoginError({ error: 'Something went wrong, please try again later.' });
    }
  }, [loginInfo]);
  

  const isAuthorized = (requiredRole) => {
    return user && user.role === requiredRole;
};


  const loginWithGoogle = async (googleUser) => {
    try {
      const response = await postRequest(`${baseUrl}/users/google-login`, {
        tokenId: googleUser.tokenId,
      });

      if (response.error) {
        console.error("Google Login Failed:", response.error);
        return;
      }

      setUser(response);
      localStorage.setItem("User", JSON.stringify(response));
    } catch (error) {
      console.error("Something went wrong with Google Login:", error);
    }
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
