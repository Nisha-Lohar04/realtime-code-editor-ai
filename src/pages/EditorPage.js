import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import ACTIONS from '../Actions';


const EditorPage = () => {
    const socketRef = useRef(null);
    const location = useLocation();
    const {roomId} = useParams();

    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [code, setCode] = useState('');

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
        if (socketRef.current) {
            socketRef.current.emit(ACTIONS.LEAVE, {
                roomId,
                username: location.state?.username,
            });
        }
    }

    useEffect(() => {
    const init = async() => {
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err) => handleErrors(err));
      socketRef.current.on('connect_failed', (err) => handleErrors(err));

      function handleErrors(e) {
            console.log('socket error', e);
            toast.error('Socket connection failed, try again later.');
            reactNavigator('/');
        }


      if (socketRef.current) {
        socketRef.current.emit(ACTIONS.JOIN, {
              roomId, 
              username: location.state?.username,
          });
      }

        //Listening for joined event
        socketRef.current.on(
            ACTIONS.JOINED,
            ({clients, username, socketId}) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                }
                setClients(clients);
                if (socketRef.current) {
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code,
                        socketId
                    });
                }
            } 
        );  

        //Listening for disconnected
        socketRef.current.on(
            ACTIONS.DISCONNECTED,
            ({socketId, username}) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => {
                    return prev.filter(
                        (client) => client.socketId !== socketId
                    );
                })

        })

        //Listening for code changes
        socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
            setCode(code);
        });

    };
    init();
    return() =>{
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.off(ACTIONS.CODE_CHANGE);
            socketRef.current.off('connect_error'); 
            socketRef.current.off('connect_failed'); 
            socketRef.current = null; 
        }
    };
  }, []);


  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
  <div className='mainWrap'> 
    <div className='aside'>
      <div className='asideInner'>
        <div className='logo'>
          <img className='logoimage' src='/code-sync.png' alt='logo'/>
        </div>
        <h3>CONNECTED!!</h3>
        <div className='clientsList'>
          {clients.map((client) => (
              <Client 
                key={client.socketId} 
                username={client.username} 
              />
            ))}
        </div>
      </div>
      <button className='btn copybtn' onClick={copyRoomId}>COPY ROOM ID</button>
      <button className='btn leavebtn' onClick={leaveRoom}>LEAVE</button>
    </div>
    <div className='editorWrap'>
      <Editor 
        socketRef={socketRef}
        roomId={roomId}
        onCodeChange={(newCode) => setCode(newCode)}
      />
    </div>
  </div>
  );
};

export default EditorPage