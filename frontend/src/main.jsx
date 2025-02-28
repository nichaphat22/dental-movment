import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext.jsx'
import { Provider } from 'react-redux'
import store from './redux/store.jsx'

import { ChakraProvider } from '@chakra-ui/react' // นำเข้า Chakra UI
import { system } from './theme' // นำเข้าธีมที่กำหนดเอง (เช่น system หรือ defaultSystem)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  
      <Provider store={store}>
        <AuthContextProvider>
          {/* ใช้ ChakraProvider พร้อมกับค่า value */}
          <ChakraProvider value={system}> 
            <App />
          </ChakraProvider>
        </AuthContextProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
)
