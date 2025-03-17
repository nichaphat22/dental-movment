import { useContext, useEffect,useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";
// import Notifications from "../components/chat/Notifications";
import "bootstrap/dist/css/bootstrap.min.css"
import './Chat.css'
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { useNavigate,useParams } from "react-router-dom";
import { IoChatboxEllipses } from "react-icons/io5";


const Chat = () => {
    const { user } = useContext(AuthContext);
    const { userChats, isUserChatsLoading, updateCurrentChat } = useContext(ChatContext);
    const [activeChatId, setActiveChatId] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();  // ดึง id จาก URL

    useEffect(() => {
        if (id) {
            setActiveChatId(id);  // ตั้งค่าจาก URL
            if (userChats && userChats.length > 0) {
                const chat = userChats.find(chat => chat._id === id);
                if (chat) {
                    updateCurrentChat(chat);  // อัปเดตข้อมูลแชทใน context
                }
            }
        }
        return () => {
            updateCurrentChat(null);
        };
    }, [id, userChats, updateCurrentChat]);
    

    const handleChatClick = (chat) => {
        setActiveChatId(chat._id);  // ตั้ง active chat
        updateCurrentChat(chat);  // อัปเดต current chat
        navigate(`/chat/${chat._id}`);  // นำทางไปที่ chat ของ chat ที่เลือก
    };

    return (
        <Container style={{
            marginTop: '75px', padding: '0 0 0 0',
            alignItems: "center",
            justifyContent: "center",
        }}>
            {/* <PotentialChats /> */}
            {userChats?.length < 1 ? null : (
                <Stack direction="horizontal" gap={0} className="align-items-start" style={{
                    width: "98%", maxWidth: "100%", margin: 'auto', height: '90vh',
                    position: 'fixed',
                    left: 0,
                    right: 0,
                }}>
            <Stack className="messages-box1 flex-grow-0 "> 
                <div className="" style={{background:'#eef1f8',justifyContent:'',color:'#000',marginLeft:'',fontSize:'22.5px',display:'inline-flex',alignItems:'center' ,padding:'0.85rem', }}><span style={{fontWeight:'400',marginRight:'4px'}} >แชต</span> <span><IoChatboxEllipses style={{color:'#9d87f1',}} size={28}/>
                </span></div>
    {isUserChatsLoading && <p></p>}
    {userChats?.map((chat) => (
        <div key={chat._id} onClick={() => handleChatClick(chat)}>
            <UserChat 
                chat={chat} 
                user={user} 
                isActive={chat._id === activeChatId} // ส่งค่า active ไปที่ UserChat
            />
        </div>
    ))}
</Stack>

                    <ChatBox />
                </Stack>
            )}
        </Container>
    );
}

export default Chat;
