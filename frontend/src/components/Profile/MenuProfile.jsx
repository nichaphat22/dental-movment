import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const MenuProfile = () => {
    const { logoutUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const ProfileMenu = ['Profile','Logout'];

    const handleMenuClick = (menu) => {
        if (menu === 'Logout'){
            logoutUser();
        } else if (menu === 'Profile'){
            navigate('/')
        }
    }
  return (
    <div className='bg-white p-2 w-24 shadow-sm absolute right-3 border-none rounded-md'>
      <ul>
        {
            ProfileMenu.map((menu)=>(
                <li 
                className='p-2 text-md cursor-pointer hover:bg-violet-100 rounded-lg' 
                key={menu}
                onClick={() => handleMenuClick(menu)}>{menu}</li>
            ))
        }
      </ul>
    </div>
  )
}

export default MenuProfile
