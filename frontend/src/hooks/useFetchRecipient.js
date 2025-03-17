import { useEffect, useState } from "react";
// import { baseUrl, getRequest } from "../utils/services";
import axios from 'axios';
export const useFetchRecipientUser = (chat, user) => {
    const [recipientUser, setRecipientUser] = useState(null);
    const [error, setError] = useState(null);

    const recipientId = chat?.members?.find((id) => id !== user?._id)

    useEffect(() => {
        const getUser = async()=> {
            if(!recipientId) return null;
            const response = await axios.get(`http://localhost:8080/api/users/find/${recipientId}`
            )
console.log('response.data',response.data)
            if(response.error) {
                return setError(error);
            }

            setRecipientUser(response.data);
        };
        getUser();
    }, [recipientId])

    return { recipientUser }
}