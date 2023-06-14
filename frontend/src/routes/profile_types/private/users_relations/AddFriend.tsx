import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Card, Container, Nav, Form, FormControl, Navbar } from "react-bootstrap";
import axios from "axios";
import { DisplayRow } from "./DisplayRowUsers";
import { getUserFriends } from "../../../../queries/userFriendsQueries";

export const AddFriend: React.FC = () => {
  const [array, setArray] = useState([])

  const handleSearchChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== "") {
      const response = await axios.get("http://localhost:3001/profile/friends/searchUsers", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("userToken")}`,
          "Content-Type": "application/json"
        },
        params: {
          login: e.target.value
        }
      });
      if (response) {
        let users = response.data.body;
        const fetchedFriends = await getUserFriends();
        users = users.filter(async (e: any) => {
          if (await isInArray(fetchedFriends, e))
            e.isFriend = true;
          else
            e.isFriend = false;
        })
        setArray(users)
      }
    }
  };

  return (
    <Card className="p-4 modify-card" style={{ height: "200px" }}>
      <Navbar className="IBM-text" style={{ fontSize: "20px" }} expand="lg">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Form className="form-inline" margin-right="auto" >
                <span style={{ marginRight: "10px" }}>Find User</span>
                <FormControl
                  type="text"
                  placeholder="Search"
                  className="mr-sm-2"
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

const isInArray = async (fetchedFriends: Array<any>, h: any) => {
  let bool = false;
  fetchedFriends.forEach((e: any) => {    
    if (e.login === h.login)
    {
      bool = true;
    }
  })
  return bool;
}

const SearchResultDisplay = (props: any) => {
  return (
    <div style={{ overflowY: "auto", overflowX: "hidden" }}>
      {props.array?.length !== 0 ? (
        props.array.filter((e: any) => {
          return localStorage.getItem("userEmail") !== e.login;
        }).map((h: any, index: any) => {
          
          return (
            <DisplayRow
              listType={"addFriend"}
              isFriend={ h.isFriend }
              key={index}
              userModel={h}
            />
          );
        })
      ) : (
        <span>No friend requests.</span>
      )}
    </div>
  );
}