import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Code2,
  Users,
  Sparkles,
  Zap,
  Hash,
  User,
  Plus,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const createNewRoom = () => {
    const id = uuidv4();

    setRoomId(id);

    toast.success("New room created successfully!");
  };

  const joinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      toast.error("Room ID and username are required.");
      return;
    }

    navigate(`/editor/${roomId.trim()}`, {
      state: {
        username: username.trim(),
      },
    });
  };

  const handleInputEnter = (event) => {
    if (event.key === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="HomePageWrapper">
      <div className="homeBackgroundGlow glowOne" />
      <div className="homeBackgroundGlow glowTwo" />

      <div className="homeContainer">

        {/* LEFT SIDE */}

        <section className="homeHero">

          <div className="homeBrand">

            <div className="homeLogoIcon">
              <Code2 size={26} />
            </div>

            <div>
              <h1>CodeSync</h1>
              <p>Collaborative coding workspace</p>
            </div>

          </div>

          <div className="heroContent">

            <div className="heroBadge">
              <span />
              REAL-TIME COLLABORATION
            </div>

            <h2>
              Code together.
              <br />
              <span>Build faster.</span>
            </h2>

            <p>
              Create or join a shared coding workspace and
              collaborate with your team in real time.
            </p>

          </div>

          <div className="featureList">

            <div className="featureItem">

              <div className="featureIcon">
                <Users size={20} />
              </div>

              <div>
                <h3>Real-time collaboration</h3>
                <p>
                  See your team and work together instantly.
                </p>
              </div>

            </div>

            <div className="featureItem">

              <div className="featureIcon">
                <Sparkles size={20} />
              </div>

              <div>
                <h3>AI-powered assistance</h3>
                <p>
                  Explain, improve and debug your code.
                </p>
              </div>

            </div>

            <div className="featureItem">

              <div className="featureIcon">
                <Zap size={20} />
              </div>

              <div>
                <h3>Multiple languages</h3>
                <p>
                  Switch between languages without losing your workflow.
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* RIGHT SIDE */}

        <section className="homeJoinSection">

          <div className="homeJoinCard">

            <div className="joinCardHeader">

              <div className="joinIcon">
                <Code2 size={24} />
              </div>

              <div>
                <h2>Join your workspace</h2>

                <p>
                  Enter your details to start collaborating.
                </p>
              </div>

            </div>


            <div className="homeForm">

              {/* ROOM ID */}

              <div className="homeInputWrapper">

                <label htmlFor="roomId">
                  Room ID
                </label>

                <div className="homeInput">

                  <Hash size={18} />

                  <input
                    id="roomId"
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(event) =>
                      setRoomId(event.target.value)
                    }
                    onKeyDown={handleInputEnter}
                  />

                </div>

              </div>


              {/* USERNAME */}

              <div className="homeInputWrapper">

                <label htmlFor="username">
                  Username
                </label>

                <div className="homeInput">

                  <User size={18} />

                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    onKeyDown={handleInputEnter}
                  />

                </div>

              </div>


              {/* JOIN */}

              <button
                className="homeJoinButton"
                onClick={joinRoom}
              >
                <span>Join Workspace</span>

                <ArrowRight size={19} />
              </button>


              {/* DIVIDER */}

              <div className="homeDivider">

                <span />

                <p>OR</p>

                <span />

              </div>


              {/* CREATE */}

              <button
                type="button"
                className="homeCreateButton"
                onClick={createNewRoom}
              >
                <Plus size={18} />

                Create a New Room

              </button>


              <p className="homeHint">
                Creating a room generates a unique Room ID.
                Share it with your collaborators.
              </p>

            </div>

          </div>


          <div className="homeFooterText">

            <span className="footerStatusDot" />

            Secure real-time coding collaboration

          </div>

        </section>

      </div>
    </div>
  );
};

export default Home;