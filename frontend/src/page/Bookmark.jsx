import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import BookMark from "../components/lesson/RPDSampleCase/BookMark";
import ChatBox from "../components/Noti";

const Bookmark = () => {
    return ( 
        <div className="flex justify-center items-center min-h-screen lg:mt-20 " >
           <Frame >
           <BookMark/>
           </Frame>
           <ChatBox/>
        </div>

     );
}
 
export default Bookmark;