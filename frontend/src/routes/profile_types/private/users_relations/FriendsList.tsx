import { useState, useEffect, useContext } from "react";
import { ItableRow, IUserStatus } from "../../../../globals/Interfaces";
import { getUserFriends } from "../../../../queries/userFriendsQueries";
import { DisplayRow } from "./DisplayRowUsers";
import { UsersStatusCxt } from "../../../../App";
import { Spinner } from "react-bootstrap";

export const FriendsList = () => {
  const usersStatus = useContext(UsersStatusCxt);

  const [friendsList, setFriendsList] = useState<ItableRow[] | undefined>(
    undefined
  );

  const [isFetched, setFetched] = useState("false");
  const [isUpdated, setUpdate] = useState(false);

  let friends: ItableRow[] = [];

  useEffect(() => {
    const fetchDataFriends = async () => {
      const result = await getUserFriends();
      if (result !== "error") return result;
    };

    const fetchData = async () => {
      let fetchedFriends = await fetchDataFriends();
      if (fetchedFriends !== undefined && fetchedFriends.length !== 0) {
        for (let i = 0; i < fetchedFriends.length; i++) {
          let newRow: ItableRow = {
            key: i,
            userModel: { login: "", nickname: "", profpic_url: "", id: 0, status: -1 },
          };
          newRow.userModel.id = fetchedFriends[i].id;
          newRow.userModel.login = fetchedFriends[i].login;
          newRow.userModel.nickname = fetchedFriends[i].nickname;

          let found = undefined;
          if (usersStatus) {
            found = usersStatus.find(
              (x: IUserStatus) => x.key === fetchedFriends[i].id
            );
            if (found) newRow.userModel.status = found.userModel.status;
          }
          newRow.userModel.profpic_url = fetchedFriends[i].profpic_url;
          friends.push(newRow);
        }
      }
      setFriendsList(friends);
      setFetched("true");
    };

    fetchData();
  }, [isUpdated, usersStatus]);

  return (
    <div style={{ overflowY: "auto", overflowX: "hidden" }}>
      {isFetched === "true" ? (
        friendsList?.length !== 0 ? (
          friendsList!.map((h, index) => {
            return (
              <DisplayRow
                listType={"friends"}
                hook={setUpdate}
                state={isUpdated}
                key={index}
                userModel={h.userModel}
              />
            );
          })
        ) : (
          <span>No friends.</span>
        )
      ) : (
        <Spinner animation="border" />
      )}
    </div>
  );
};
