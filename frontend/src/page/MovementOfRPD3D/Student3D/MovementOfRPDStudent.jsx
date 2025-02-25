import React, { useState } from "react";
import NavBarLeft from "../../../components/navbar/NavBarLeft";
import Frame from "../../../components/Frame";
import View_MovementOfRPD_Student from "../../../components/lesson/MovementOfRPD/View_MovementOfRPD_Student";
import ChatBox from "../../../components/Noti";

const MovementOfRPDStudent = () => {
  return (
    <div className="mt-[60px] flex">
      <NavBarLeft />

      {/* Main Content Area */}
      <div className="flex-1 p-4 ml-0 sm:ml-56 lg:ml-64 space-y-4">
        <Frame className="overflow-auto">
          <View_MovementOfRPD_Student />
        </Frame>

        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
};

export default MovementOfRPDStudent;
