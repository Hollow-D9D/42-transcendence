import { useState, useEffect, useContext } from "react";
import { ItableRow, IUserStatus } from "../../../../globals/Interfaces";
import { getUserPending } from "../../../../queries/userQueries";
import { DisplayRow } from "./DisplayRowUsers";
import { UsersStatusCxt } from "../../../../App";
import { Spinner } from "react-bootstrap";

export const PendingList = () => {
  const usersStatus = useContext(UsersStatusCxt);

  const [pendingList, setPendingList] = useState<ItableRow[] | undefined>(
    undefined
  );

  const [isFetched, setFetched] = useState("false");
  const [isUpdated, setUpdate] = useState(false);

  let pending: ItableRow[] = [];

  useEffect(() => {
    const fetchDataPending = async () => {
      const result = await getUserPending();
      if (result !== "error") return result;
    };
    const fetchData = async () => {
      let fetchedPending = await fetchDataPending();

      if (fetchedPending !== undefined && fetchedPending.length !== 0) {
        for (let i = 0; i < fetchedPending.length; i++) {
          let newRow: ItableRow = {
            key: i,
            userModel: { nickname: "", login: "", profpic_url: "", id: 0, status: -1 },
          };
          newRow.userModel.id = fetchedPending[i].id;
          newRow.userModel.login = fetchedPending[i].login;
          newRow.userModel.nickname = fetchedPending[i].nickname;
          let found = undefined;
          if (usersStatus) {
            found = usersStatus.find(
              (x: IUserStatus) => x.key === fetchedPending[i].id
            );
            if (found) newRow.userModel.status = found.userModel.status;
          }
          newRow.userModel.profpic_url = fetchedPending[i].profpic_url;
          pending.push(newRow);
        }
      }
      setPendingList(pending);
      setFetched("true");
    };

    fetchData();
  }, [isUpdated, usersStatus]);

  return (
    <div style={{ overflowY: "auto", overflowX: "hidden" }}>
      {isFetched === "true" ? (
        pendingList?.length !== 0 ? (
          pendingList!.map((h, index) => {
            return (
              <DisplayRow
                listType={"pending"}
                hook={setUpdate}
                state={isUpdated}
                key={index}
                userModel={h.userModel}
              />
            );
          })
        ) : (
          <span>No friend requests.</span>
        )
      ) : (
        <Spinner animation="border" />
      )}
    </div>
  );
};
