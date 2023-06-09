import { useContext, useState } from "react";
import { Col, Card, Row, Form } from "react-bootstrap";
import { NotifCxt } from "../../../App";
import {
  // updateUsernameQuery,
  updateNicknameQuery,
} from "../../../queries/updateUserQueries";

export const ModifyEntry = (props: any) => {
  const notif = useContext(NotifCxt);
  const initialValues = {
    nickname: "",
    userName: "",
  };

  const [userInput, setUserInput] = useState(initialValues);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    console.log("name::::::::", name, value)
    console.log("nickname:::::::::", userInput.nickname)
    setUserInput({
      ...userInput,
      [name]: value,
    });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (userInput.nickname || userInput.nickname === "") {
      const updateNickname = async () => {
        const result = await updateNicknameQuery(userInput.nickname);
        console.log("update:::::::::", result)
        if (result !== "error") {
          const button = document.getElementById("handleChange");
          if (button) {
            button.setAttribute("name", "nickname");
            button.setAttribute("value", userInput.nickname);
            props.changeUserInfoHook(e);
            props.onClick();
          }
        } else {
          notif?.setNotifText(
            "Nickname already taken. Please enter another nickname."
          );
          notif?.setNotifShow(true);
        }
      };
      updateNickname();
    }
  };
  return (
    <Col className="col-6">
      <Card className="p-5 modify-card">
        <Card.Body>
          <div>
            <form>
              <div className="">
                <SpecificEntry
                  toEdit={props.toEdit}
                  setUserInput={handleInputChange}
                  userInput={userInput}
                />
                <Row>
                  <Col></Col>
                  <Col>
                    <button
                      type="button"
                      className="btn btn-sm submit-button float-end"
                      onClick={props.onClick}
                    >
                      Cancel
                    </button>
                  </Col>
                  <Col>
                    <button
                      id="handleChange"
                      className="btn btn-sm submit-button float-end"
                      onClick={(e: any) => {
                        handleSubmit(e);
                      }}
                    >
                      Done
                    </button>
                  </Col>
                </Row>
              </div>
            </form>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};

const SpecificEntry = (props: any) => {
  if (props.toEdit === "EMAIL")
    return (
      <EntryIsEmail
        setUserInput={props.setUserInput}
        modifyInput={props.userInput.nickname}
      />
    );
  if (props.toEdit === "USERNAME")
    return (
      <EntryIsUsername
        setUserInput={props.setUserInput}
        modifyInput={props.userInput.userName}
      />
    );
  return null;
};

const EntryIsUsername = (props: any) => {
  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label className="IBM-text" style={{ fontSize: "20px" }}>
          USERNAME
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="new username"
          onChange={props.setUserInput}
          value={props.modifyInput}
          name="userName"
        />
      </Form.Group>
    </div>
  );
};

const EntryIsEmail = (props: any) => {
  return (
    <div>
      <Form.Group className="mb-3">
        <Form.Label className="IBM-text" style={{ fontSize: "20px" }}>
          NICKNAME
        </Form.Label>
        <Form.Control
          type="nickname"
          placeholder="new nickname"
          onChange={props.setUserInput}
          value={props.modifyInput}
          name="nickname"
        />
      </Form.Group>
    </div>
  );
};
