import React, { useContext, useEffect, useState } from "react";
import JSCookies from "js-cookie";
import { UserContext } from "../../contexts/UserContext";
import { AiOutlineEdit } from "react-icons/ai";
import { useMyDisplayedChatContext } from "../../contexts/Displayed_Chat_Context";
import ListFriends from "./ListFriends";
import UserName from "./UserName";
import UserPhoto from "./UserPhoto";
import { useMyContext } from "../../contexts/InfoCardContext";
import GameHistory from "./GamesHistory";
import UserStats from "./UserStatistics";
import { our_socket } from "../../utils/context/SocketContext";
import { Link } from "react-router-dom";

type Props = {
  // setShowUserInto: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserPage = ({}: Props) => {
  const { userId } = useContext(UserContext);
  const { userIdCard, setShowUserInto } = useMyContext();
  const { displayed_chat, setDisplayed_chat } = useMyDisplayedChatContext();
  const [isVisible, setIsVisible] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [TFA, setTFA] = useState(false);
  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [gamesList, setGamesList] = useState([]);
  const isMe = userId === userIdCard;
  const [isFriend, setIsFriend] = useState(false);
  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    setShowUserInto(false);
  };

  const startChat = async () => {
    try {
      const response = await fetch(
        `http://localhost:3003/conversation/join_dialogue/${userIdCard}`,
        {
          method: "Get",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSCookies.get("accessToken")}`,
          },
        }
      );
      console.log("join chat");
      const conv = await response.json();
      setDisplayed_chat(conv);
      setShowUserInto(false);
    } catch (error) {
      alert("Could not go to chat");
    }
  };

  const startGame = async () => {
   
  };

  const updateFriendsList = async () => {
 if (isFriend) {
      try {
        const response = await fetch(
          "http://localhost:3003/user/remove_friend",
          {
            method: "Put",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${JSCookies.get("accessToken")}`,
            },
            body: JSON.stringify({ removing_you: userIdCard }),
          }
        );
        console.log(response);
        setIsFriend(false);
      } catch (error) {
        alert("Could not modify friends list");
      }
    } else {
      try {
        const response = await fetch("http://localhost:3003/user/add_friend", {
          method: "Post",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSCookies.get("accessToken")}`,
          },
          body: JSON.stringify({ adding_you: userIdCard }),
        });
        console.log(response);
        setIsFriend(true);
      } catch (error) {
        alert("Could not modify friends list");
      }
    }
  };

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("http://localhost:3003/user/user_data", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSCookies.get("accessToken")}`,
        },
        body: JSON.stringify({ user_id: userIdCard }),
      });
      const data = await response.json();
      setUserName(data["name"]);
      setUserEmail(data["mail"]);
      setTFA(data["two_FA_enabled"]);
      setFriendsList(data["friendlist"]);
      setGamesList(data["games"]);
      setIsFriend(data["friendlist"].includes(Number(userId)));
    };
    if (userIdCard) getData();
  }, [userIdCard, isFriend]);

  function startAndinvitePlayers(username : string)
  {
    console.log("Inviting player " + username);
    setShowUserInto(false);
    our_socket.emit('createInvitationRoom', userId);
  }
  return (
    <>
      {true && (
        <div id="userInfo">
          <div id="stats">
            <div>
              <UserPhoto userId={userIdCard} />
            </div>

            <div id="generic-info">
              <span>{`Player: ${userName}`}</span>
              <span>{`Email: ${userEmail}`}</span>
              {isMe ? <span>{`2FA enabled: ${TFA}`}</span> : <span></span>}

              {isMe ? (
                <div></div> //////REMINDER TO CHANGE THIS
              ) : (
                <div id="buttons">
                  <button className="purple-button" onClick={startChat}>
                    Chat
                  </button>
                  <Link to="/game">
                  {//Username}//
}
                  <button className="purple-button" onClick={() => startAndinvitePlayers(userId)}>
                    
                    Play
                  </button>
                  </Link>
                  <button className="purple-button" onClick={updateFriendsList}>
                    {" "}
                    {isFriend ? "Unfriend" : "Friend"}
                  </button>
                </div>
              )}
            </div>
            <UserStats userId={userIdCard} />
          </div>
          <button id="exit-buttton" onClick={toggleVisibility}>
            X
          </button>
          <div id="lists">
            <ListFriends friendsList={friendsList} />
            <GameHistory gamesList={gamesList} />
          </div>
        </div>
      )}
    </>
  );
};

export default UserPage;

type Game = {
  id: number;
  player_one: number;
  player_two: number;
  winner: number;
  loser: number;
  score_one: number;
  score_two: number;
  finished: boolean;
};
