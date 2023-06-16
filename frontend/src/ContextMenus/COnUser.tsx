import { useContext, useEffect, useState } from "react";
import { Menu, Item } from "react-contexify";
import { useNavigate } from "react-router-dom";
import { NotifCxt } from "../App";
import { addFriendQuery, getFriendFriends } from "../queries/userFriendsQueries";
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
      const friends = await getFriendFriends(props.userModel.username);
      if (result !== "error" && friends != "error") {
        result.forEach((e: any) => {
          friends.forEach((f: any) => {
            if (e.login === f.login) {
              setIsFriend(true);
              console.log("aaa", e.login, f.login, isFriend);
            }
          })
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
      {isFriend ? null : (
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
