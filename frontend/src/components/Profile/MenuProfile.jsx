import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { API } from '../../api/api';
import { logoutUser } from '../../redux/authSlice'; // Ensure this is the correct import

const MenuProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await API.get('/api/auth/logout');
      dispatch(logoutUser());
      navigate('/login'); // Redirect after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const ProfileMenu = ['Profile', 'Logout'];

  const handleMenuClick = (menu) => {
    if (menu === 'Logout') {
      handleLogout();
    } else if (menu === 'Profile') {
      navigate('/profile'); // Navigate to profile page
    }
  };

  return (
    <div className='bg-white p-2 w-24 shadow-sm absolute right-3 border-none rounded-md'>
      <ul>
        {ProfileMenu.map((menu) => (
          <li
            className='p-2 text-md cursor-pointer hover:bg-violet-100 rounded-lg'
            key={menu}
            onClick={() => handleMenuClick(menu)}
          >
            {menu}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MenuProfile;
