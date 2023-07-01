import { useState, ChangeEvent, useEffect } from "react";
import {
  Card,
  Container,
  Nav,
  Form,
  FormControl,
  Navbar,
} from "react-bootstrap";
import { DisplayRow } from "./DisplayRowUsers";
import { getUserFriends } from "../../../../queries/userFriendsQueries";
import { Api } from "../../../../Config/Api";

export const AddFriend: React.FC = () => {
  const [array, setArray] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchValue !== "") {
        const response = await Api.get("/profile/friends/searchUsers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            "Content-Type": "application/json",
          },
          params: {
            login: searchValue,
          },
        });

        if (response) {
          let users = response.data.body;
          users = users.filter((e: any) => {
            return e.login !== localStorage.getItem("userEmail");
          });
          users = users.filter((e: any) => {
            let blocks = e.blocked_users;
            if (blocks.length !== 0) {
              return blocks.some(
                (block: any) => block.login !== localStorage.getItem("userEmail")
              );
            }
            return true;
          });

          if (users.length !== 0) {
            const fetchedFriends = await getUserFriends();
            users = users.filter(async (e: any) => {
              if (await isInArray(fetchedFriends, e)) e.isFriend = true;
              else e.isFriend = false;
            });
          }
          setArray(users);
        }
      } else {
        setArray([]);
      }
    };

    fetchUsers();
  }, [searchValue]);

  return (
    <Card className="p-4 modify-card" style={{ height: "200px" }}>
      <Navbar className="IBM-text" style={{ fontSize: "20px" }} expand="lg">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Form className="form-inline" margin-right="auto">
                <span style={{ marginRight: "10px" }}>Find User</span>
                <FormControl
                  type="text"
                  placeholder="Search"
                  className="mr-sm-2"
                  value={searchValue}
                  onChange={handleSearchChange}
                />
              </Form>
              <SearchResultDisplay array={array} />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Card>
  );
};

export const isInArray = async (fetchedFriends: Array<any>, h: any) => {
  let bool = false;
  fetchedFriends.forEach((e: any) => {
    if (e.login === h.login) {
      bool = true;
    }
  });
  return bool;
};

const SearchResultDisplay = (props: any) => {
  return (
    <div style={{ overflowY: "auto", overflowX: "hidden" }}>
      {props.array?.length !== 0 ? (
        props.array
          .map((h: any, index: any) => {
            return (
              <DisplayRow
                listType={"addFriend"}
                isFriend={h.isFriend}
                key={'friend' + JSON.stringify(h)}
                userModel={h}
              />
            );
          })
      ) : (
        <span></span>
      )}
    </div>
  );
};
