import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { baseUrl } from '../utils/services';

const GoogleLoginButton = ({ onLoginSuccess }) => {
  const handleLoginWithGoogle = async(response) => {
    const decoded = jwtDecode(response.credential);
    try {
      const res = await fetch(`${baseUrl}/users/google/token`, {
        method: 'POST',
        headers: { 'Content-Type' : 'application/json'},
        body: JSON.stringify({ token: response.credential }),
      }); 
       if (res.ok){
        const data = await res.json();
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
       } else {
        console.error('Failed to authenticate');
       }
    } catch (error) {
      console.error('Login Error:', error);
    }
    onLoginSuccess(decoded);
  };

  const handleLoginWithGoogleError = () => {
    console.error('Google Login Failed');
  };

  return <GoogleLogin 
    onSuccess={handleLoginWithGoogle} 
    onError={handleLoginWithGoogleError} 
  />;
};

export default GoogleLoginButton;
