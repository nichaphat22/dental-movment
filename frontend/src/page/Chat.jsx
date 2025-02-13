import { useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { Container, Stack } from "react-bootstrap";
import UserChat from "../components/chat/UserChat";
import { AuthContext } from "../context/AuthContext";
import PotentialChats from "../components/chat/PotentialChats";
import ChatBox from "../components/chat/ChatBox";
// import Notifications from "../components/chat/Notifications";
import "bootstrap/dist/css/bootstrap.min.css"
import './Chat.css'
const Chat = () => {
    const { user } = useContext(AuthContext);
    const { userChats, isUserChatsLoading, updateCurrentChat } = useContext(ChatContext);

    useEffect(() => {
        return () => {
            updateCurrentChat(null);
        };
    }, [updateCurrentChat]);
    

    return (
        <Container style={{ marginTop: '80px', padding: '0 0 0 5px' }}>
            <PotentialChats />
            {userChats?.length < 1 ? null : (
                <Stack direction="horizontal" gap={2} className="align-items-start">
                    <Stack className="messages-box1 flex-grow-0 pe-3">
                        {isUserChatsLoading && <p></p>}
                        {userChats?.map((chat) => (
    <div key={chat._id} onClick={() => updateCurrentChat(chat)}>
        <UserChat chat={chat} user={user} />
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
