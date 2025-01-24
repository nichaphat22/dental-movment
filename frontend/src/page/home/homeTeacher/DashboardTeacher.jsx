import React, { useEffect,useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DashboardTeacher = () => {
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
    useEffect(() => {
        if(token){
            (async()=> fetchUser(token))()
        }else{
            navigate("/googleLogin")
        }
    },[])
    if(loading){
        return <div>loading....</div>
    }
  return (
    <div>
        <h1>Teacher Dashboard</h1>
    </div>
  )
}

export default DashboardTeacher
