import { useContext, useEffect, useState } from "react";
import { Menu, Item } from "react-contexify";
import { useNavigate } from "react-router-dom";
import { NotifCxt } from "../App";
import { addFriendQuery } from "../queries/userFriendsQueries";
import { getOtherUser } from "../queries/otherUserQueries";
import { setUserInfo } from "../queries/userInfoSlice";
import { getUserFriends } from "../queries/userFriendsQueries";

export const COnUser = (props: any) => {
  const navigate = useNavigate();
  const notif = useContext(NotifCxt);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const fetchDataFriends = async () => {
      const result = await getUserFriends();
      if (result !== "error") {
        result.forEach((e: any) => {
          if (e.login === props.userModel.username) {
            setIsFriend(true);
          }
        })
      };
    }
    fetchDataFriends();
  })

  // Function to handle adding user as friend
  const handleClick = (otherId: number, otherUsername: string) => {
    const addFriend = async () => {
      const result = await addFriendQuery(otherId);
      if (result !== "error") {
        notif?.setNotifText("Friend request sent to " + otherUsername + "!");
      } else notif?.setNotifText("Could not send friend request :(.");
      notif?.setNotifShow(true);
    };
    addFriend();
  };

  // JSX to display menu items for user
  return (
    <Menu id="onUser">
      <Item
        data={{ key: "value" }}
        onClick={({ props }) => {
          navigate("/app/public/" + props.userModel.username);
          window.location.reload();
        }}
      >
        see profile
      </Item>
      {!isFriend && (
        <Item
          onClick={({ props }) => {
            handleClick(props.userModel.id, props.userModel.username);
          }}
        >
          add as friend
        </Item>
      )}
    </Menu>
  );
};
