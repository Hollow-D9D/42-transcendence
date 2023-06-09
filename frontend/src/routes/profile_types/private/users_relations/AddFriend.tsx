import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Card, Container, Nav, Form, FormControl, Navbar } from "react-bootstrap";
import axios from "axios";
import { DisplayRow } from "./DisplayRowUsers";

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
        setArray(response.data.body)
      }
    }
  };

  // useEffect(() => {
  //   console.log("res", array)
  //   return (
  //     <div style={{ overflowY: "auto", overflowX: "hidden" }}>
  //       {array?.length !== 0 ? (
  //         array!.map((h: any, index: any) => {
  //           console.log("h:", h.login, "index:", index)
  //           return (
  //             <DisplayRow
  //               listType={"addFriend"}
  //               // hook={setUpdate}
  //               // state={isUpdated}
  //               key={index}
  //               userModel={h.userModel}
  //             />
  //           );
  //         })
  //       ) : (
  //         <span>No friend requests.</span>
  //       )}
  //     </div>
  //   );
  // })

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
            <SearchResultDisplay array={array}/>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Card>
  );
};

const SearchResultDisplay = (props: any) => {
  const [isUpdated, setUpdate] = useState(false)
  console.log(props);
  return (
      <div style={{ overflowY: "auto", overflowX: "hidden" }}>
          {props.array?.length !== 0 ? (
              props.array.filter((e : any) => {
                return localStorage.getItem("userEmail") !== e.login;
              }).map((h: any, index: any) => {
                  console.log("h:", h.login, "index:", index)
                  return (
                      <DisplayRow
                          listType={"addFriend"}
                          hook={setUpdate}
                          state={isUpdated}
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