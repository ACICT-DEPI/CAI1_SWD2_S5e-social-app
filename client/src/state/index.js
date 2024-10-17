import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light",
  user: null,
  token: null,
  posts: [],
  messages: [], 
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setMessages: (state, action) => {
      state.messages = action.payload.fetchedMessages; 
    },
    addMessage: (state, action) => {
      const newMessage = action.payload; // Assuming payload contains the complete message object
      state.messages.push(newMessage);

    },
    
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(message => message._id !== action.payload); 
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setFriends: (state, action) => {
      if (state.user) {
        state.user.friends = action.payload.friends;
      } else {
        console.error("user friends non-existent :(");
      }
    },
    setPosts: (state, action) => {
      state.posts = action.payload.posts;
    },
    setPost: (state, action) => {
      const updatedPosts = state.posts.map((post) => {
        if (post._id === action.payload.post._id) return action.payload.post;
        return post;
      });
      state.posts = updatedPosts;
    },
    deletePost: (state, action) => {
    
      state.posts = state.posts.filter(post => post._id !== action.payload.id);
    },
  },
});

export const { setMode, setLogin, setLogout, setFriends, setPosts, setPost, deletePost ,setMessages,addMessage,deleteMessage} =
  authSlice.actions;
export default authSlice.reducer;
