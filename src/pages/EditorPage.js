import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";

import Client from "../components/Client";
import Editor from "../components/Editor";
import AIAssistant from "../components/AIAssistant";

import { initSocket } from "../socket";

import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

import ACTIONS from "../Actions";


const EditorPage = () => {
  const socketRef = useRef(null);

  const location = useLocation();

  const { roomId } = useParams();

  const reactNavigator =
    useNavigate();


  const [clients, setClients] =
    useState([]);

  const [socket, setSocket] =
    useState(null);


  const [language, setLanguage] =
    useState("javascript");


  const [code, setCode] =
    useState(
      "// Start coding here...\n"
    );


  const [aiWidth, setAiWidth] =
    useState(420);

  const [isResizing, setIsResizing] =
    useState(false);


  const username =
    location.state?.username;


  /* ==========================================
     CODE CHANGE
  ========================================== */

  const handleCodeChange =
    useCallback((newCode) => {
      setCode(newCode);
    }, []);


  /* ==========================================
     COPY ROOM ID
  ========================================== */

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(
        roomId
      );

      toast.success(
        "Room ID has been copied to your clipboard"
      );

    } catch (err) {

      console.error(err);

      toast.error(
        "Could not copy Room ID"
      );
    }
  };


  /* ==========================================
     LEAVE ROOM
  ========================================== */

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit(
        ACTIONS.LEAVE,
        {
          roomId,
          username,
        }
      );
    }

    reactNavigator("/");
  };


  /* ==========================================
     SOCKET CONNECTION
  ========================================== */

  useEffect(() => {
    if (!username) return;

    let newSocket;

    const init = async () => {
      try {
        newSocket =
          await initSocket();

        socketRef.current =
          newSocket;


        const handleErrors = (
          error
        ) => {
          console.error(
            "Socket connection error:",
            error
          );

          toast.error(
            "Socket connection failed. Please try again."
          );
        };


        const handleConnect = () => {
          console.log(
            "Socket connected:",
            newSocket.id
          );

          newSocket.emit(
            ACTIONS.JOIN,
            {
              roomId,
              username,
            }
          );
        };


        const handleJoined = ({
          clients: connectedClients,
          username: joinedUsername,
        }) => {

          setClients(
            connectedClients
          );

          if (
            joinedUsername !== username
          ) {
            toast.success(
              `${joinedUsername} joined the room.`
            );
          }
        };


        const handleDisconnected = ({
          socketId,
          username: leftUsername,
        }) => {

          setClients((prev) =>
            prev.filter(
              (client) =>
                client.socketId !== socketId
            )
          );

          toast.success(
            `${leftUsername} left the room.`
          );
        };


        const handleLanguageChange = ({
          language: newLanguage,
        }) => {
          setLanguage(newLanguage);
        };


        newSocket.on(
          "connect_error",
          handleErrors
        );

        newSocket.on(
          "connect",
          handleConnect
        );

        newSocket.on(
          ACTIONS.JOINED,
          handleJoined
        );

        newSocket.on(
          ACTIONS.DISCONNECTED,
          handleDisconnected
        );

        newSocket.on(
          ACTIONS.LANGUAGE_CHANGE,
          handleLanguageChange
        );


        setSocket(newSocket);

      } catch (error) {

        console.error(
          "Socket initialization error:",
          error
        );

        toast.error(
          "Could not initialize the socket connection."
        );
      }
    };


    init();


    return () => {
      if (newSocket) {

        newSocket.off(
          "connect_error"
        );

        newSocket.off(
          "connect"
        );

        newSocket.off(
          ACTIONS.JOINED
        );

        newSocket.off(
          ACTIONS.DISCONNECTED
        );

        newSocket.off(
          ACTIONS.LANGUAGE_CHANGE
        );


        newSocket.disconnect();


        if (
          socketRef.current === newSocket
        ) {
          socketRef.current = null;
        }
      }
    };

  }, [roomId, username]);


  /* ==========================================
     LANGUAGE CHANGE
  ========================================== */

  const handleLanguageChange = (
    selectedLanguage
  ) => {

    setLanguage(selectedLanguage);

    if (socketRef.current) {
      socketRef.current.emit(
        ACTIONS.LANGUAGE_CHANGE,
        {
          roomId,
          language: selectedLanguage,
        }
      );
    }
  };


  /* ==========================================
     AI PANEL RESIZING
  ========================================== */

  const startResizing = () => {
    setIsResizing(true);
  };


  useEffect(() => {

    const handleMouseMove = (
      event
    ) => {

      if (!isResizing) return;

      const newWidth =
        window.innerWidth -
        event.clientX;

      const minWidth = 360;

      const maxWidth =
        window.innerWidth * 0.55;


      if (
        newWidth >= minWidth &&
        newWidth <= maxWidth
      ) {
        setAiWidth(newWidth);
      }
    };


    const stopResizing = () => {
      setIsResizing(false);
    };


    if (isResizing) {

      document.addEventListener(
        "mousemove",
        handleMouseMove
      );

      document.addEventListener(
        "mouseup",
        stopResizing
      );


      document.body.style.userSelect =
        "none";

      document.body.style.cursor =
        "col-resize";
    }


    return () => {

      document.removeEventListener(
        "mousemove",
        handleMouseMove
      );

      document.removeEventListener(
        "mouseup",
        stopResizing
      );


      document.body.style.userSelect =
        "";

      document.body.style.cursor =
        "";
    };

  }, [isResizing]);


  /* ==========================================
     REDIRECT
  ========================================== */

  if (!location.state) {
    return <Navigate to="/" />;
  }


  /* ==========================================
     UI
  ========================================== */

  return (

    <div className="mainWrap">


      {/* SIDEBAR */}

      <aside className="aside">


        {/* LOGO */}

        <div className="logo">

          <img
            className="logoimage"
            src="/code-sync.png"
            alt="Code Sync"
          />

        </div>


        {/* CONNECTED USERS */}

        <div className="asideInner">

          <div className="connectedHeader">

            <div>

              <p className="sidebarLabel">
                CONNECTED USERS
              </p>


              <div className="onlineCount">

                <span />

                {clients.length}{" "}
                {clients.length === 1
                  ? "online"
                  : "online"}

              </div>

            </div>

          </div>


          <div className="clientsList">

            {clients.map((client) => (

              <Client
                key={client.socketId}

                username={
                  client.username
                }

                isCurrentUser={
                  client.username === username
                }
              />

            ))}

          </div>

        </div>


        {/* ROOM CONTROLS */}

        <div className="roomControls">

          <button
            className="btn copybtn"
            onClick={copyRoomId}
          >
            COPY ROOM ID
          </button>


          <button
            className="btn leavebtn"
            onClick={leaveRoom}
          >
            LEAVE ROOM
          </button>

        </div>

      </aside>


      {/* MAIN EDITOR */}

      <main className="editorWrap">


        {/* COMPACT HEADER */}

        <div className="topHeader">

          <div className="workspaceTitle">

            <div className="workspaceBadge">
              LIVE
            </div>


            <div className="workspaceText">

              <h2>
                Collaborative Workspace
              </h2>

              <p>
                Real-time code collaboration
              </p>

            </div>

          </div>


          {/* LANGUAGE */}

          <div className="headerActions">

            <div className="languageSelector">

              <label htmlFor="language">
                Language
              </label>


              <select
                id="language"
                value={language}

                onChange={(e) =>
                  handleLanguageChange(
                    e.target.value
                  )
                }
              >

                <option value="javascript">
                  JavaScript
                </option>

                <option value="python">
                  Python
                </option>

                <option value="java">
                  Java
                </option>

                <option value="cpp">
                  C++
                </option>

                <option value="html">
                  HTML
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* WORKSPACE */}

        <div
          className={`workspace ${
            isResizing
              ? "resizing"
              : ""
          }`}
        >


          {/* CODE EDITOR */}

          <section className="codeEditorPanel">

            <div className="editorSectionHeader">

              <span className="sectionLabel">
                &lt;/&gt; CODE EDITOR
              </span>


              <span className="sectionLanguage">
                {language}
              </span>

            </div>


            <div className="editorContainer">

              <Editor
                socketRef={socketRef}
                socket={socket}
                roomId={roomId}
                language={language}
                onCodeChange={
                  handleCodeChange
                }
              />

            </div>

          </section>


          {/* RESIZE HANDLE */}

          <div
            className="resizeHandle"
            onMouseDown={startResizing}
          />


          {/* AI ASSISTANT */}

          <section
            className="aiAssistantPanel"

            style={{
              width: `${aiWidth}px`,
            }}
          >

            <AIAssistant
              code={code}
              language={language}
            />

          </section>

        </div>

      </main>

    </div>
  );
};

export default EditorPage;