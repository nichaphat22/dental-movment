import React, { useState } from "react";

import NavBarLeft from "../../components/navbar/NavBarLeft";
import Frame from "../../components/Frame";
import View_MovementOfRPD from "../../components/lesson/MovementOfRPD/View_MovementOfRPD";
import View_Animation3d from "../../components/lesson/MovementOfRPD/View_Animation3D";
import ChatBox from "../../components/Noti";

const ViewMovementOfRPD = () => {
  return (
    <div className="mt-[60px] flex">
      <NavBarLeft />

      {/* Main Content Area */}
      <div className="flex-1 p-4 ml-0 sm:ml-56 lg:ml-64 space-y-4">
        <Frame className="overflow-auto">
          <View_Animation3d />
        </Frame>

        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
};

export default ViewMovementOfRPD;
