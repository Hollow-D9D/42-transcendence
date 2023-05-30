import { useContext } from "react";
import { Menu, Item } from "react-contexify";
import { useNavigate } from "react-router-dom";
import { NotifCxt } from "../App";
import { addFriendQuery } from "../queries/userFriendsQueries";

// Component to display a menu with options for a user on a certain event
export const COnUser = (props: any) => {
  const navigate = useNavigate();
  const notif = useContext(NotifCxt);

  // Function to handle adding user as friend
  const handleClick = (otherId: number, otherUsername:string) => {
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
          navigate("/app/public/" + props.who);
          window.location.reload();
        }}
      >
        see profile
      </Item>
      <Item
        onClick={({ props }) => {
          handleClick(props.who, props.username);
        }}
      >
        add as friend
      </Item>
    </Menu>
  );
};
