import React, { useState } from "react";
import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import Add_RPD from "../components/lesson/RPDSampleCase/Add_RPD";
import ChatBox from "../components/Noti";
const AddRPDSampleCase = () => {
  return (
    <div className="mt-[100px] flex">
      <NavBarLeft />

      {/* Main Content Area */}
      <div className="flex-1 p-4 ml-0 sm:ml-56 lg:ml-64 space-y-4">
        <Frame className="overflow-auto">
          <Add_RPD />
        </Frame>

        {/* ChatBox */}
        {/* <ChatBox /> */}
      </div>
    </div>
  );
};

export default AddRPDSampleCase;
