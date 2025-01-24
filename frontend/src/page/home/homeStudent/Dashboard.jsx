import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState<any>({})
    const [loading, setLoading] = useState(true)

    const fetchUser = async (token) => {
        try {
            const res = await fetch("http://localhost:8080/api/auth/profile", {
                headers:{
                    'Authorization':'bearer '+token,
                    'Content-Type':'application/json'
                },
                method: 'GET'
            })
            const data = await res.json()
            setUser(data)
        } catch (error) {
            navigate("/googleLogin")
        }finally{
            setLoading(false)
        }
    }

    const token = localStorage.getItem("token") || ''
    useEffect(()=>{
        if(token){
            (async()=> fetchUser(token))()
        }else{
            navigate("/googleLogin")
        }
    },[])
    if(loading){
        return <div>loading....</div>
    }
    const logoutFn = () =>{
        localStorage.removeItem("token")
        navigate("/login")
    }
  return (
    <div>
      <h1>Dashboard</h1>
        <center>
            {
                JSON.stringify(user)
            }
            <button onClick={logoutFn}>logout</button>
        </center>
    </div>
  )
}

export default Dashboard
