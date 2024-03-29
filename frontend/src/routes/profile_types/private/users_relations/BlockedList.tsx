import { useState, useEffect, useContext } from "react";
import { ItableRow, IUserStatus } from "../../../../globals/Interfaces";
import { getUserBlocked } from "../../../../queries/userQueries";
import { DisplayRow } from "./DisplayRowUsers";
import { UsersStatusCxt } from "../../../../App";
import { Spinner } from "react-bootstrap";

export const BlockedList = () => {
  const usersStatus = useContext(UsersStatusCxt);

  const [blockedList, setBlockedList] = useState<ItableRow[] | undefined>(
    undefined
  );

  const [isFetched, setFetched] = useState("false");
  const [isUpdated, setUpdate] = useState(false);

  let blocked: ItableRow[] = [];

  useEffect(() => {
    const fetchDataBlocked = async () => {
      const result = await getUserBlocked();
      if (result !== "error") return result;
    };

    const fetchData = async () => {
      let fetchedBlocked = await fetchDataBlocked();

      if (fetchedBlocked !== undefined && fetchedBlocked.length !== 0) {
        for (let i = 0; i < fetchedBlocked.length; i++) {
          let newRow: ItableRow = {
            key: i,
            userModel: { login: "", nickname: "", profpic_url: "", id: 0, status: -1 },
          };
          newRow.userModel.id = fetchedBlocked[i].id;
          newRow.userModel.login = fetchedBlocked[i].login;
          newRow.userModel.nickname = fetchedBlocked[i].nickname;
          let found = undefined;
          if (usersStatus) {
            found = usersStatus.find(
              (x: IUserStatus) => x.key === fetchedBlocked[i].id
            );
            if (found) newRow.userModel.status = found.userModel.status;
          }
          newRow.userModel.profpic_url = fetchedBlocked[i].profpic_url;
          blocked.push(newRow);
        }
      }
      setBlockedList(blocked);
      setFetched("true");
    };

    fetchData();
  }, [isUpdated, usersStatus]);

  return (
    <div style={{ overflowY: "auto", overflowX: "hidden" }}>
      {isFetched === "true" ? (
        blockedList?.length !== 0 ? (
          blockedList!.map((h, index) => {
            return (
              <DisplayRow
                listType={"blocked"}
                hook={setUpdate}
                state={isUpdated}
                key={index}
                userModel={h.userModel}
              />
            );
          })
        ) : (
          <span>No blocked users.</span>
        )
      ) : (
        <Spinner animation="border" />
      )}
    </div>
  );
};

