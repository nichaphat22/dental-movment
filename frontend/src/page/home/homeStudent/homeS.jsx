import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const homeS = () => {
const [searchParams] = useSearchParams()
const navigate = useNavigate()
        useEffect(()=>{
            const token = searchParams.get("token") || ''
            if(token){
                localStorage.setItem("token", token)
                navigate("/")
            }else{
                navigate("/googleLogin")
            }
        },[searchParams])

  return (
    <>
        TokenWithBe:{searchParams.get("token")}
    </>
  )
}

export default homeS
