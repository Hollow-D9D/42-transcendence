// import { useContext, useState } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import { NotifCxt } from "../App";
// import { uploadAvatarQuery } from "../queries/avatarQueries";

// export function MUploadAvatar(props: any) {
//   const notif = useContext(NotifCxt);
//   const [newAvatar, setNewAvatar] = useState<any>();

//   const onChange = (e: any) => {
//     setNewAvatar(e.target.files[0]);
//   };

//   const handleSubmit = (event: any) => {
//     if (newAvatar) {
//       const uploadAvatar = async () => {
//         console.log("1111:::::::::::")
//         const result_1 = await uploadAvatarQuery(newAvatar);
//         if (result_1 !== "error") {
//           props.isAvatarUpdated();
//           props.onHide();
//         } else {
//           notif?.setNotifText(
//             "Unable to upload avatar. Please try again later."
//           );
//           notif?.setNotifShow(true);
//         }
//       };
//       uploadAvatar();
//     }
//   };

//   return (
//     <Modal
//       show={props.show}
//       onHide={props.onHide}
//       size="lg"
//       aria-labelledby="contained-modal-title-vcenter"
//       centered
//     >
//       <Modal.Header closeButton>
//         <Modal.Title id="contained-modal-title-vcenter">
//           Upload Avatar
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <Form.Group controlId="formFile" className="mb-3">
//           <Form.Label>Choose an image to use as your avatar.</Form.Label>
//           <Form.Control type="file" onChange={onChange} />
//         </Form.Group>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="outline-danger" onClick={props.onHide}>
//           Close
//         </Button>
//         <Button variant="outline-success" onClick={handleSubmit}>
//           Submit
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// }


import { useContext, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { NotifCxt } from "../App";
import { uploadAvatarQuery } from "../queries/avatarQueries";

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
          const imagePath = `/upload/${newAvatar.name}`; // Path to the image in the /public/upload folder
          await saveImageToPublicFolder(newAvatar); // Save the image to the /public/upload folder
          const result_1 = await uploadAvatarQuery(imagePath); // Send the image path to the backend
          if (result_1 !== "error") {
            props.isAvatarUpdated();
            props.onHide();
          } else {
            notif?.setNotifText(
              "Unable to upload avatar. Please try again later."
            );
            notif?.setNotifShow(true);
          }
        } catch (error) {
          console.error("Error uploading avatar:", error);
          notif?.setNotifText("Error uploading avatar. Please try again later.");
          notif?.setNotifShow(true);
        }
      };
      uploadAvatar();
    }
  };

  const saveImageToPublicFolder = async (file: any) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      await fetch("/upload", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Error saving image:", error);
      throw error;
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
