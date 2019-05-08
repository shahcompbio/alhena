import React, {Component} from "react";

import {Button, Container, Image, Menu, Visibility} from "semantic-ui-react";

const menuStyle = {
  borderRadius: 0,
  boxShadow: "none",
  marginBottom: "1em",
  marginTop: "1em",
  transition: "box-shadow 0.5s ease, padding 0.5s ease"
};

const fixedMenuStyle = {
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.2)"
};

class StickyHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menuFixed: false,
      overlayFixed: false
    };
  }

  stickTopMenu = () => this.setState({menuFixed: true});

  unStickTopMenu = () => this.setState({menuFixed: false});

  render() {
    const {menuFixed} = this.state;
    const {onSearchClick} = this.props;

    return (
      <div>
        <Visibility
          onBottomPassed={this.stickTopMenu}
          onBottomVisible={this.unStickTopMenu}
          once={false}
        >
          <Menu
            borderless
            fixed={menuFixed ? "top" : undefined}
            style={menuFixed ? fixedMenuStyle : menuStyle}
          >
            <Container text>
              <Menu.Item>
                <Image size="mini" src="" />
              </Menu.Item>
              <Menu.Item header>SC-1234</Menu.Item>
              <Menu.Item as="a">Sample ID</Menu.Item>
              <Menu.Item as="a">Dashboard</Menu.Item>
              <Menu.Item>
                <Button.Group>
                  <Button onClick={onSearchClick}>Search</Button>
                </Button.Group>
              </Menu.Item>
            </Container>
          </Menu>
        </Visibility>
      </div>
    );
  }
}
export default StickyHeader;
