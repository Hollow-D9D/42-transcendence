import { Menu, Item } from "react-contexify";
import { useNavigate } from "react-router-dom";

export const COnUser = (props: any) => {
  const navigate = useNavigate();
  return (

    (<Menu id="onUser">
      {
        <Item
          data={{ key: "value" }}
          onClick={({ props }) => {
            navigate("/app/public/" + props.userModel.username);
            window.location.reload();
          }}
        >
          see profile
        </Item>}

    </Menu>)
  );
};
