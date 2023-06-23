import { useContext, useEffect, useState } from "react";
import { Menu, Item } from "react-contexify";
import { useNavigate } from "react-router-dom";
import { NotifCxt } from "../App";
import { addFriendQuery, getFriendFriends } from "../queries/userFriendsQueries";

export const COnUser = (props: any) => {
  const navigate = useNavigate();
  const notif = useContext(NotifCxt);
  // const [isInBlocked, setIsInBlocked] = useState<boolean>(false);

  // useEffect(() => {
  //   const fetchDataFriends = async () => {
  //     const result = await getFriendFriends(props.userModel.username, "");
  //     if (result.length !== 0) {
  //       result.some((block: any) => {
  //         if (block.login === localStorage.getItem("userEmail")) {
  //           setIsInBlocked(true);
  //           console.log("isInBlocked", block.login, localStorage.getItem("userEmail"), isInBlocked);
  //           return
  //         }
  //       });
  //     }
  //   };

  //   fetchDataFriends()

  //   console.log("login:", props.userModel.username);
  // })


  return (

    (<Menu id="onUser">
      {
      // isInBlocked ? null :
        <Item
          data={{ key: "value" }}
          onClick={({ props }) => {
            navigate("/app/public/" + props.userModel.username);
            window.location.reload();
          }}
        >
          see profile
        </Item>}

    </Menu>)
  );
};
