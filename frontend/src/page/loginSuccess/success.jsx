import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const { role } = decoded;

      if (role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (role === 'student') {
        navigate('/student-dashboard');
      } else {
        navigate('/');
      }
    } else {
      navigate("/");
    }
  }, [searchParams, navigate]);

  return <div>Redirecting...</div>;
};

export default Success;
