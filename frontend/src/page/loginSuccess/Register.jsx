import React, { useState } from 'react';
import { API } from '../../api/api';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/api/auth/register', { email, password, name});
            alert('Registration Successful');
        } catch (error) {
            console.error(error.response.data);
        }
    };

  return (
    <div>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type='submit'>Register</button>
        </form>
      
    </div>
  );
};

export default Register;;
