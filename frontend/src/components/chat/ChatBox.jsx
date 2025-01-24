import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { Stack } from "react-bootstrap";
import moment from "moment";
import InputEmoji from "react-input-emoji";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faFileImage, faFilePdf } from "@fortawesome/free-solid-svg-icons"; // Import FontAwesome icons
import './Chat.css'
// import { fill } from "core-js/core/array";


const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const { currentChat, messages, isMessagesLoading, sendTextMessage } = useContext(ChatContext);
    const { recipientUser } = useFetchRecipientUser(currentChat, user);
    const [textMessage, setTextMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); // State for selected file
    const fileInputRef = useRef(null); // Ref for file input element
    const scroll = useRef();

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (scroll.current) {
            scroll.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const formatFileName = (fileName) => {
        if (fileName.length > 10) {
            return fileName.substring(0, 10) + '...' + fileName.substring(fileName.length - 4);
        }
        return fileName;
    };

    // Function to format bytes into readable file size
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };



    // Function to handle file input change
    const handleFileChange = (e) => {
        const reader = new FileReader();
        const file = e.target.files[0];
        reader.onload = (ev) => {
            setSelectedFile({
                name: file.name,
                data: ev.target.result,
                type: file.type,
                size: file.size
            });
        };
        reader.readAsDataURL(file); // Read file as Data URL
    };

    // Function to clear selected file
    const clearFile = () => {
        setSelectedFile(null);
        fileInputRef.current.value = ""; // Clear file input
    };



    const formatFileNamelength = (fileName) => {
        if (fileName.length > 10) {
            return fileName;
        }
        return fileName;
    };


    // Function to send message (text or file)
    const handleSendMessage = () => {
        sendTextMessage(textMessage, user, currentChat?._id, selectedFile, setTextMessage, setSelectedFile);
    };

    if (!recipientUser) {
        return <p style={{ textAlign: "center", width: "100%" }}>No Conversation selected yet...</p>;
    }

    if (isMessagesLoading) {
        return <p style={{ textAlign: "center", width: "100%" }}>Loading Chat...</p>;
    }

    return (
        <Stack gap={30} className="chat-box">
            <div className="chat-header">
                <strong>{recipientUser.fname} {recipientUser.lname}</strong>
            </div>
            <Stack gap={3} className="messages">
                {messages && messages.map((message, index) => (
                    <Stack
                        key={index}
                        className={`message ${message.senderId === user._id ? "self align-self-end flex-grow-0" : "align-self-start flex-grow-0"}`}
                        ref={index === messages.length - 1 ? scroll : null}
                    >
                        {/* Display text message */}
                        <span> {message.text && (
                            <span className="textmessage" style={{backgroundColor: message.senderId === user._id ? '#7600A9' : '#fff',  borderRadius: '25px' }}>
                                {message.text}
                            </span>
                        )}</span>
                       

                        {/* Display file */}
                        <span>{message.file && message.file.type && message.file.data && (
                            <div className={`file-preview ${message.senderId === user._id ? "self-file" : ""}`}>
                                {message.file.type.startsWith('image') ? (
                                    <img src={message.file.data} alt={message.file.name} className="file-image" style={{ maxWidth: '100%', maxHeight: '250px', marginTop: '10px', backgroundColor: 'none' }} />
                                ) 
                              
                                : (
                                    <div className="file-preview2">
                                        <Stack direction="horizontal" gap={2} className="file-preview">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor"  className="bi bi-file-text-fill" viewBox="0 0 16 16">
                                                <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1" />
                                            </svg>
                                            <div className="file-info">
                                                <a href={message.file.data} download={message.file.name} style={{color: message.senderId === user._id ? '#F0F0F0' : '#000' }}>{formatFileNamelength(message.file.name)}</a>
                                                <span className="size" style={{color: message.senderId === user._id ? '#F0F0F0' : '#666666 ', fontSize:'10px' }}>{formatBytes(message.file.size)}</span>
                                            </div>
                                        </Stack>
                                    </div>
                                )
                                }
                            </div>
                        )}</span>
                        
                        <span className="message-footer" style={{ fontSize: '8px', color: message.senderId === user._id ? '#F0F0F0' : '#666666 ' }}>{moment(message.createdAt).calendar()}</span>



                    </Stack>
                ))}

            </Stack>
            <Stack direction="horizontal"  className="chat-input flex-grow-0">

                <InputEmoji
                    value={textMessage}
                    onChange={setTextMessage}
                    borderColor="#DADADA"
                    background="#F2F2F2"
                />
                <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
                    <input
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.txt,.csv"
                        onChange={handleFileChange}
                        id="file-upload"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" style={{color:'#232323'}} className="bi bi-images" viewBox="0 0 16 16">
                        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
                        <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z" />
                    </svg>
                </label>
                <button className="send-btn" onClick={handleSendMessage}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-send-fill" viewBox="0 0 16 16">
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                    </svg>
                </button>

            </Stack>
            {selectedFile && (
                <span className="file-preview3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-file-text-fill" viewBox="0 0 16 16">
                                                <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1" />
                                            </svg>
                    <span>{formatFileName(selectedFile.name)}</span>
                    <button  style={{borderRadius:'5px', fontSize:'10px'}} onClick={clearFile}>Clear</button>
                </span>
            )}
            
        </Stack>
    );
};


export default ChatBox;

