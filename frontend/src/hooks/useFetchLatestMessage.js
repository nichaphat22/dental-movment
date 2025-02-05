import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { baseUrl, getRequest } from "../utils/services";

export const useFetchLatestMessage = (chat) => {
    const { newMessage, notifications } = useContext(ChatContext);
    const [latestMessage, setLatestMessage] = useState();

    useEffect(() => {
        const getMessages = async () => {
            if (!chat?._id) {
                // console.log("No chatId provided");
                return;
            }

            try {
                // ส่งคำขอ GET ไปยังเซิร์ฟเวอร์เพื่อดึงข้อความทั้งหมดจากแชทที่กำหนด
                const response = await getRequest(`${baseUrl}/messages/${chat._id}`);

                // ตรวจสอบข้อผิดพลาดในการดึงข้อมูล
                if (response.error) {
                    console.log("error getting message...", response.error);
                    return;
                }

                // ดึงข้อความล่าสุดจากการตอบสนอง (สมมุติว่าข้อความถูกจัดเรียงตามลำดับเวลา)
                const lastMessage = response[response.length - 1];

                // อัปเดตสถานะ latestMessage ด้วยข้อความล่าสุด
                setLatestMessage(lastMessage);
            } catch (error) {
                console.log("error getting message...", error);
            }
        };

        getMessages();
    }, [newMessage, notifications, chat?._id]); // การเรียกใช้งาน useEffect ขึ้นอยู่กับ newMessage, notifications, และ chat._id

    return { latestMessage };
};
