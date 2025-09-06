import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [roomId, SetRoomId] = useState('');
  const [username, SetUsername] = useState('');
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    SetRoomId(id);
    toast.success("CREATED A NEW ROOM!!");
  };

  const joinRoom = () => {
    if(!roomId || !username){
      toast.error("ROOM ID & USERNAME IS REQUIRED !!")
      return;
    }
    
    //redirect
    navigate(`/editor/${roomId}`,{
      state:{ 
        username,

      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter'){
      joinRoom();

    }
  };

  return (
    <div className="HomePageWrapper">
      <div className="FormWrapper">
        <img className="HomePageLogo" src="/code-sync.png" alt="code-sync-logo" />
        <h4 className='mainLabel'>  Paste Invitation Room Id </h4>
        <div className='inputGroup'>
          <input 
            type='text' 
            className='inputBox' 
            placeholder='Room Id' 
            onChange={(e) => SetRoomId(e.target.value)} 
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input 
            type='text' 
            className='inputBox' 
            placeholder='USERNAME' 
            onChange={(e) => SetUsername(e.target.value)} 
            value={username}
            onKeyUp={handleInputEnter}
          />
          <button className='btn joinbtn'onClick={joinRoom}> JOIN </button> 
          <span className='createInfo'> If you don't have an invite, then create &nbsp;
            <a onClick={createNewRoom} href='' className='createNewBtn'> NEW ROOM</a>
          </span>
        </div>
      </div>
      <footer>
      <h4>BUILT WITH 💛 BY ENTHUSIASTIC CODER </h4>
      </footer>
    </div>
  );
};

export default Home; 
