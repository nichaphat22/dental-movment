import React, { useEffect,useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DashboardTeacher = () => {
    const navigate = useNavigate()
    // const [user, setUser] = useState<any>({})
    const [loading, setLoading] = useState(true)

  
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
