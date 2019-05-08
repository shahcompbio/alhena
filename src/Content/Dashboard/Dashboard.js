import React, {Component} from "react";
import {Container, Visibility} from "semantic-ui-react";

const overlayStyle = {
  float: "left",
  margin: "0em 3em 1em 0em"
};

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }
  render() {
    return (
      <Container style={{height: "100vh"}}>
        <Visibility offset={80} once={false} style={overlayStyle} />
      </Container>
    );
  }
}
export default Dashboard;
