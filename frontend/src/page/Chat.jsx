import { useContext, useEffect,useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
// import PotentialChats from "../components/chat/PotentialChats";
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
        <div  style={{
            position: 'relative',  // กำหนดให้ container นี้เป็น "root" ของการจัดตำแหน่ง
            height: '100vh',
            width: '100%'}}>
        <Container style={{ padding: '0 0 0 0',
            alignItems: "center",
            justifyContent: "center",
        }}>
            {/* <PotentialChats /> */}
            {userChats?.length < 1 ? null : (
                <Stack direction="horizontal" gap={0} className="align-items-start" style={{
                    width: "98%", maxWidth: "100%", margin: 'auto', height: '90vh',
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom:0,
                    // zIndex:50,
                }}>
            <Stack className="messages-box1 flex-grow-0 "> 
                <div className="" style={{borderRadius:'10px 10px 0 0',border: '1px solid #DADADA',borderBottom:  '1px solid rgba(216, 216, 216, 0.9)', boxShadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em',background:'#9d87f1',justifyContent:'',color:'',marginLeft:'',fontSize:'25px',display:'inline-flex',alignItems:'center' ,padding:'0.7rem', }}><span style={{fontWeight:'350',color:'#e6dfff',marginRight:'4px'}} >แชต</span> <span><IoChatboxEllipses style={{color:'#e6dfff',}} size={30}/>
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
        </div>
  );
}

export default Chat;
