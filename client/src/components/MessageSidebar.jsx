import { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions"; 
import EmojiPicker from "emoji-picker-react"; 
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, addMessage, deleteMessage } from "../state/index";
import io from "socket.io-client";
import { useMediaQuery } from '@mui/material';

const MessageSidebar = ({ selectedFriend, handleClose, userId }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const messages = useSelector((state) => state.messages);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const socket = useRef(null);

  useEffect(() => {
    // Connect to the socket
    socket.current = io("http://localhost:3001"); // Adjust URL as needed

    // Register the user
    socket.current.emit("register", userId);

    // Listen for incoming messages
    socket.current.on("send_message_to_user", (newMessage) => {
      dispatch(addMessage(newMessage));

    });

    return () => {
      socket.current.disconnect();
    };
  }, [dispatch, userId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        sender: userId,
        receiver: selectedFriend._id,
        text: message,
      };


      // Emit the message via socket
      socket.current.emit("chat_message", newMessage);
      setMessage(""); // Clear input
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/messages/${userId}/${selectedFriend._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      dispatch(setMessages({ fetchedMessages: response.data.messages }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`http://localhost:3001/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(deleteMessage(messageId));
      setAnchorEl(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleMenuClick = (event, messageId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessageId(null);
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const isMobile = useMediaQuery('(max-width:600px)'); // تحقق إذا كانت الشاشة موبايل

  useEffect(() => {
    const isMobile = window.innerWidth < 600; // Adjust the width as needed for mobile detection
  
    return () => {
      if (isMobile) {
        document.body.style.overflow = "hidden"; // Re-enable scrolling when sidebar closes
      }
      else {
        document.body.style.overflow = "auto"; // Enable scrolling when sidebar closes
      }
    };
  }, []);
  

  return (
    <Box sx={{
      position: "fixed",
      right: 0,
      top: 1,
      bottom: 1,
      width: { xs: "100vw", md: "400px" },
      height: "100vh",
      backgroundColor: "#00000080",
      backdropFilter: "blur(10px)",
      color: "white",
      boxShadow: "-20px 10px 10px rgba(0, 0, 0, 0.3)",
      padding: "1rem",
      zIndex: 1100,
      display: "flex",
      flexDirection: "column",
      
    }}>   
      <IconButton onClick={handleClose} sx={{ color: "#FFFFFF", position: "absolute", top: "1rem", right: "1rem" }}>
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" fontWeight="500" mb="1.5rem" sx={{ color: "#F0F0F0" }}>
        Chat with {selectedFriend?.name}
      </Typography>

          <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto", // Only the messages container should scroll
          padding: "0.77rem",
          backgroundColor: "transparent",
          borderRadius: "8px",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#0A0A0A",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#0A0A0A",
          },
        }}
      >

        {loading ? (
          <Typography variant="body2" sx={{ color: "#888888" }}>Loading messages...</Typography>
        ) : !messages || messages.length === 0 ? (
          <Typography variant="body2" sx={{ color: "#888888" }}>No messages yet.</Typography>
        ) : (
          messages.map((message) => (
    
            
            <Box key={message._id} sx={{
              mb: "0.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: message.sender === userId ? "flex-end" : "flex-start",
            }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", color: "#B0B0B0", marginBottom: "0.2rem" }}>
                {message.sender === userId ? "You" : selectedFriend.name}
              </Typography>

              
              <Box sx={{
                display: "flex",
                justifyContent: message.sender === userId ? "flex-end" : "flex-start",
                width: "100%",
                marginBottom: "1rem",
              }}>
                {message.sender === userId && (
                  <IconButton onClick={(event) => handleMenuClick(event, message._id)}>
                    <MoreHorizIcon />
                  </IconButton>
                )}
                <Box sx={{
                  flexGrow: 1,
                  maxWidth: "60%",
                  padding: "0.5rem 1rem",
                  backgroundColor: message.sender === userId ? "#E0E0E0" : "#3C3C3C",
                  color: message.sender === userId ? "#1E1E1E" : "#ffff",
                  borderRadius: message.sender === userId ? "10px 10px 0px 10px" : "10px 10px 10px 0px",
                  wordWrap: "break-word",
                  direction: /[\u0600-\u06FF]/.test(message.text) ? "rtl" : "ltr",
                }}>
                  <Typography variant="body2">{message.text}</Typography>
                  <Typography variant="caption" sx={{ color: "#B0B0B0", display: "block" }}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{
        display: "flex",
        alignItems: "center",
        padding: "0rem",
        bgcolor: "#333333",
        borderRadius: "5px",
      }}>
        <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)} sx={{ color: "#FFFFFF" }}>
          <EmojiEmotionsIcon />
        </IconButton>

        {showEmojiPicker && (
          <Box sx={{
            position: "absolute",
            bottom: "60px",
            right: "10px",
            zIndex: 1300,
          }} ref={emojiPickerRef}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </Box>
        )}

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
          style={{
            flexGrow: 1,
            padding: "0.5rem",
            border: "none",
            borderRadius: "5px",
            marginLeft: "0.5rem",
            backgroundColor: "transparent",
            color: "#FFFFFF",
            outline: "none",
          }}
          placeholder="Type a message..."
        />

        <IconButton
          onClick={handleSendMessage}
          disabled={!message}
          sx={{
            color: message ? "#FFFFFF" : "gray",
            borderRadius: "0 5px 5px 0",
          }}>
          <SendIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            margin: "8px",
          },
        }}>
        <MenuItem onClick={() => {
          handleDeleteMessage(selectedMessageId);
          handleMenuClose();
        }}>
          Delete Message
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MessageSidebar;
