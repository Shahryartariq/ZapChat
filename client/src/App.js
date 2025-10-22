import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import io from "socket.io-client";

const Page = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: #46516e;
  color: white;
`;

const ChatSection = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const UsersSection = styled.div`
  flex: 1;
  border-left: 1px solid #999;
  padding: 20px;
  background-color: #3b4561;
  overflow-y: auto;
`;

const UserItem = styled.div`
  background: ${(props) => (props.me ? "pink" : "#556080")};
  color: ${(props) => (props.me ? "#46516e" : "white")};
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 10px;
  text-align: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  max-height: 500px;
  overflow: auto;
  width: 400px;
  border: 1px solid lightgray;
  border-radius: 10px;
  padding-bottom: 10px;
  margin-top: 25px;
`;

const TextArea = styled.textarea`
  width: 98%;
  height: 100px;
  border-radius: 10px;
  margin-top: 10px;
  padding: 10px;
  font-size: 17px;
  background-color: transparent;
  border: 1px solid lightgray;
  outline: none;
  color: lightgray;
  ::placeholder {
    color: lightgray;
  }
`;

const Button = styled.button`
  background-color: pink;
  width: 100%;
  border: none;
  height: 50px;
  border-radius: 10px;
  color: #46516e;
  font-size: 17px;
`;

const Form = styled.form`
  width: 400px;
`;

const MyRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

const MyMessage = styled.div`
  width: 45%;
  background-color: pink;
  color: #46516e;
  padding: 10px;
  margin-right: 5px;
  text-align: left;
  border-top-right-radius: 10%;
  border-bottom-right-radius: 10%;
`;

const PartnerRow = styled(MyRow)`
  justify-content: flex-start;
`;

const PartnerMessage = styled.div`
  width: 45%;
  background-color: transparent;
  color: lightgray;
  border: 1px solid lightgray;
  padding: 10px;
  margin-left: 5px;
  text-align: left;
  border-top-left-radius: 10%;
  border-bottom-left-radius: 10%;
`;

const SystemMessage = styled.div`
  text-align: center;
  color: #cfcfcf;
  font-style: italic;
  margin: 10px 0;
`;

const App = () => {
  const [yourID, setYourID] = useState();
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect("/");

    socketRef.current.on("connect", () => {
      setYourID(socketRef.current.id);
      setConnected(true); // ✅ Frontend knows it’s connected
    });

    socketRef.current.on("user list", (usersList) => {
      setUsers(usersList);
    });

    socketRef.current.on("message", (msg) => {
      setMessages((oldMsgs) => [...oldMsgs, msg]);
    });

    socketRef.current.on("system message", (text) => {
      setMessages((oldMsgs) => [...oldMsgs, { system: true, text }]);
    });
  }, []);

  const joinChat = () => {
    if (username.trim() === "") return alert("Please enter your name");
    socketRef.current.emit("join", username);
    setJoined(true);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const msgObj = {
      body: message,
      sender: username,
      id: yourID,
    };
    socketRef.current.emit("send message", msgObj);
    setMessage("");
  };

  if (!joined) {
    return (
      <Page style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h2>Welcome to ChatApp</h2>
          {connected ? (
            <p style={{ color: "lightgreen" }}>✅ Connected to server</p>
          ) : (
            <p style={{ color: "red" }}>🔴 Connecting...</p>
          )}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              marginRight: "10px",
              width: "200px",
            }}
          />
          <Button onClick={joinChat}>Join Chat</Button>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <ChatSection>
        <Container>
          {messages.map((msg, index) => {
            if (msg.system) {
              return <SystemMessage key={index}>{msg.text}</SystemMessage>;
            }
            const isMe = msg.id === yourID;
            return isMe ? (
              <MyRow key={index}>
                <MyMessage>
                  <b>You:</b> {msg.body}
                </MyMessage>
              </MyRow>
            ) : (
              <PartnerRow key={index}>
                <PartnerMessage>
                  <b>{msg.sender}:</b> {msg.body}
                </PartnerMessage>
              </PartnerRow>
            );
          })}
        </Container>

        <Form onSubmit={sendMessage}>
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type yourrr message..."
          />
          <Button>Send</Button>
        </Form>
      </ChatSection>

      <UsersSection>
        <h3>Connected Users</h3>
        {Object.entries(users).map(([id, name]) => (
          <UserItem key={id} me={id === yourID}>
            {name} {id === yourID && "(You)"}
          </UserItem>
        ))}
      </UsersSection>
    </Page>
  );
};

export default App;
