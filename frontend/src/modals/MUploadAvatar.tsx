import { useContext, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { NotifCxt } from "../App";
import { uploadAvatarQuery } from "../queries/avatarQueries";
import { Api } from "../Config/Api";
export function MUploadAvatar(props: any) {
  const notif = useContext(NotifCxt);
  const [newAvatar, setNewAvatar] = useState<any>();

  const onChange = (e: any) => {
    setNewAvatar(e.target.files[0]);
  };

  const handleSubmit = (event: any) => {
    if (newAvatar) {
      const uploadAvatar = async () => {
        try {
          const fileName = await uploadAvatarQuery(newAvatar);

          await Api.get("/profile/editNickname", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("userToken")}`,
              "Content-Type": "application/json",
            },
            params: {
              newdata: { avatar_url: fileName },
            },
          });
          const setAvatarToLocalStorage = async () => {
            localStorage.setItem(
              "userPicture",
              `${process.env.REACT_APP_BACKEND_SOCKET}/upload/${fileName}`
            );
          };
          setAvatarToLocalStorage();
          props.isAvatarUpdated();
          props.onHide();
        } catch (error) {
          notif?.setNotifText('' + error);
          notif?.setNotifShow(true);
        }
      };
      uploadAvatar();
    }
  };

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Upload Avatar
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Choose an image to use as your avatar.</Form.Label>
          <Form.Control type="file" onChange={onChange} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={props.onHide}>
          Close
        </Button>
        <Button variant="outline-success" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
