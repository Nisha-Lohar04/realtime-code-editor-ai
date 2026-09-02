import React from "react";
import Avatar from "react-avatar";

const Client = ({ username, isCurrentUser }) => {
  return (
    <div className="client">

      <div className="clientAvatarWrapper">

        <Avatar
          name={username}
          size="50"
          round="16px"
          className="clientAvatar"
        />

        <span className="onlineIndicator" />

      </div>


      <div className="clientInfo">

        <span className="userName">
          {username}
        </span>

        {isCurrentUser && (
          <span className="youBadge">
            You
          </span>
        )}

      </div>

    </div>
  );
};

export default Client;