import React from "react";

const NoMatch = ({ location }) => (
  <div>
    <h3>
      Sorry, <code>{location.pathname}</code> cannot be found.
    </h3>
  </div>
);

export default NoMatch;
