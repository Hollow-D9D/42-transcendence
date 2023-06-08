import { Col, Card, Container, Nav, Form, FormControl, Navbar } from "react-bootstrap";

export const AddFriend = () => {
  return (
    <Card className="p-4 modify-card" style={{ height: "200px" }}>
      <Navbar className="IBM-text" style={{ fontSize: "20px" }} expand="lg">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Form className="form-inline" margin-right="auto">
                <span style={{ marginRight: "10px" }}>Find User</span>
                <FormControl type="text" placeholder="Search" className="mr-sm-2" />
              </Form>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Card>
  );
};