import { FaPlus } from "react-icons/fa6";
import Conversation from "../components/Conversation";
import Messages from "../components/Messages";
import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { setSocket, setOnlineUsers } from "../Redux/socketSlice";
import { logout } from "../Redux/authSlice";
import io from "socket.io-client";
import { RiLogoutBoxLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendId, setFriendId] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.userData);

  const logoutUser = () => {
    dispatch(logout())
    navigate('/login')
  }

  const addFriend = async () => {
    if (!friendId) {
      toast.error("Id cannot be empty", {
        theme: "dark",
        autoClose: 2000,
        hideProgressBar: true,
      })
    }
    else {
      try {
        const data = JSON.parse(localStorage.getItem("user"));
        const token = data?.userData?.token;
        const response = await axios.post(`http://localhost:3000/api/v1/addFriend/${friendId}`,{}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setFriendId("");
        const friendName = response.data.data.name;
        toast.success(`${friendName} is added.`, {
          theme: "dark",
          autoClose: 2000,
          hideProgressBar: true,
        })
      } catch (error) {
        setFriendId("");
        toast.error("Failed to add user", {
          theme: "dark",
          autoClose: 2000,
          hideProgressBar: true,
        })
        console.log(error);
      }
    }
  }

  useEffect(() => {
    const getConversation = async () => {
      setLoading(true);
      const data = JSON.parse(localStorage.getItem("user"));
      const token = data?.userData?.token;
      try {
        const response = await axios.get("http://localhost:3000/api/v1/friends", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setConversations(response.data.data);
      } catch (error) {
        toast.error("Error fetching conversation", {
          theme: "dark",
          autoClose: 2000,
          hideProgressBar: true,
        });
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getConversation();
  }, []);

  useEffect(() => {
    const socket = io('localhost:3000', {
      query: {
        userId: user.userData._id
      }
    });
    dispatch(setSocket(socket));

    socket.on('getOnlineUsers', (users) => {
      dispatch(setOnlineUsers(users));
    })
    return () => {
      socket.disconnect();
    }
  }, [dispatch, user])

  return (
    <div className="flex h-screen w-screen overflow-x-auto overflow-y-auto">
      {loading ? (
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="loading loading-ring loading-lg"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col w-1/3 min-w-[400px] max-w-[500px]">
            <div className="flex flex-col sticky top-0 z-10">
              <div className="flex h-16 w-full">
                <div className="flex items-center basis-[75%] lg:basis-[85%]">
                  <h1 className="text-[1.75rem] font-semibold m-4 ml-10 text-white">
                    Chats
                  </h1>
                </div>
                <div className="flex items-center justify-end">
                  <div
                    className="flex p-2 w-12 btn btn-ghost rounded-full hover:bg-slate-900 cursor-pointer mt-1 mr-3"
                    onClick={() => document.getElementById('my_modal_5').showModal()}
                  >
                    <RiLogoutBoxLine className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <div
                    className="flex p-2 w-12 btn btn-ghost rounded-full hover:bg-slate-900 cursor-pointer mt-1"
                    onClick={() => document.getElementById('my_modal_10').showModal()}
                  >
                    <FaPlus className="w-6 h-6" />
                  </div>
                </div>
              </div>
              <div className="flex m-4">
                <label className="input input-bordered flex items-center gap-2 w-full h-10">
                  <input type="text" className="grow" placeholder="Search" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="h-4 w-4 opacity-70"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </label>
              </div>
              <div className="flex justify-evenly h-10 items-center mb-6">
                <h1 className="text-sm cursor-pointer font-semibold text-white underline underline-offset-4 decoration-[1.5px] de">
                  ACTIVE NOW
                </h1>
                <h1 className="text-sm cursor-pointer hover:text-white">
                  CONTACTS
                </h1>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <Conversation
                  key={conversation._id}
                  conversation={conversation}
                />
              ))}
            </div>
          </div>
          <div className="flex h-full w-2/3 grow">
            <Messages />
          </div>
        </>
      )}
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Are you sure?</h3>
          <p className="py-4">You will be logged out!</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn mr-3 btn-ghost">Close</button>
              <button className="btn" onClick={logoutUser}>Logout</button>
            </form>
          </div>
        </div>
      </dialog>
      <dialog id="my_modal_10" className="modal">
        <div className="modal-box w-full">
          <h3 className="font-bold text-lg mb-4">Hello!</h3>
          <input
            type="text"
            placeholder="Enter friend id"
            className="input input-bordered input-primary w-full"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
          />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-3" >Close</button>
              <button className="btn" onClick={addFriend}>Add</button>
            </form>
          </div>
        </div>
      </dialog>
      <ToastContainer />
    </div>
  );
};

export default Home;
