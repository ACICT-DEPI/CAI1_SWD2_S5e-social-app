import axios from "axios";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  MoreHoriz,
  Send,
  CheckCircleOutline,
} from "@mui/icons-material";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'; // أيقونة ملونة

import {
  Box,
  Divider,
  IconButton,
  Typography,
  TextField,
  Button,
  useTheme,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, deletePost } from "state";
import CommentLikeButton from "components/CommentLikeButton";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  picturePath,
  videoPath,
  audioPath,
  userPicturePath,
  likes,
  comments,
  createdAt,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editComment, setEditComment] = useState("");
  const [anchorElPost, setAnchorElPost] = useState(null);
  const [currentCommentId, setCurrentCommentId] = useState(null);
  const [currentPostId, setCurrentpostId] = useState(null);
  const [anchorElComment, setAnchorElComment] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.dark;
  const primary = palette.primary.main;

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const patchLike = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:3001/posts/${postId}/like`,
        { userId: loggedInUserId },
        axiosConfig
      );
      dispatch(setPost({ post: response.data }));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim()) {
      try {
        const response = await axios.post(
          `http://localhost:3001/posts/${postId}/comment`,
          { userId: loggedInUserId, comment: newComment },
          axiosConfig
        );
        dispatch(setPost({ post: response.data }));
        setNewComment("");
        // Show Snackbar
      } catch (error) {
        console.error("Error submitting comment:", error);
      }
    }
  };

  const handleEditSubmit = async (commentId) => {
    if (editComment.trim()) {
      try {
        const response = await axios.patch(
          `http://localhost:3001/posts/${postId}/comment/${commentId}`,
          { userId: loggedInUserId, editComment },
          axiosConfig
        );
        dispatch(setPost({ post: response.data }));
        setEditCommentId(null);
        setEditComment("");
        setSnackbarMessage("Comment edited!");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error editing comment:", error);
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/posts/${postId}/comment/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { userId: loggedInUserId },
        }
      );
      dispatch(setPost({ post: response.data }));
      setSnackbarMessage("Comment deleted!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
  // هي دي فانكشن ال delete ي حوده
  const handleDeletePost = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(deletePost({ id: postId }));
      setSnackbarMessage("Post deleted!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleMenuOpenComment = (event, commentId) => {
    setAnchorElComment(event.currentTarget);
    setCurrentCommentId(commentId);
  };

  const handleMenuCloseComment = () => {
    setAnchorElComment(null);
    setCurrentCommentId(null);
  };
  const handleMenuOpenPost = (event) => {
    setAnchorElPost(event.currentTarget);
    setCurrentpostId(postId);
  };
  const handleMenuClosePost = () => {
    setAnchorElPost(null);
    setCurrentpostId(null);
  };
  // دي فانكشن بتاعه الوقت  ال ف ال كومنت
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} y`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} M`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} d`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} h`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} m`;

    return `${seconds} s`;
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  return (
<WidgetWrapper
  m="1rem 0"
  sx={{
    boxShadow: 2,
    boxShadow: "0px 0px 20px 10px rgba(0, 0, 0, 0.1)", 
  }}
>      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        position="relative"
        
      >
        <Friend
          friendId={postUserId}
          name={name}
          userPicturePath={userPicturePath}
        />
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: "-13px", marginLeft: "65px" }}
        >
          {new Date(createdAt).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
        {loggedInUserId === postUserId && (
          <div style={{ position: "absolute", top: 0, right: 0 }}>
            <IconButton
              onClick={handleMenuOpenPost}
              sx={{
                color: "orange",
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  color: "darkorange",
                },
              }}
            >
              <MoreHoriz sx={{ fontSize: "28px" }} />
            </IconButton>
            <Menu
              anchorEl={anchorElPost}
              open={Boolean(anchorElPost)}
              onClose={handleMenuClosePost}
              PaperProps={{
                sx: {
                  zIndex: 1300,
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleDeletePost();
                  handleMenuClosePost();
                }}
              >
                Delete Post
              </MenuItem>
            </Menu>
          </div>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={2000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          message={
            <Box display="flex" alignItems="center">
              <CheckCircleOutline sx={{ color: "green", marginRight: "8px" }} />
              <Typography variant="body2">{snackbarMessage}</Typography>
            </Box>
          }
          sx={{
            backgroundColor: "black", // تغيير لون الخلفية إلى داكن
            borderRadius: "4px",
          }}
        />
      </Box>

      <Typography
        sx={{
          mt: "1.3rem",
          ml: "30px",
          fontSize: "20px",
          fontWeight: 400,
          direction: /\p{Script=Arabic}/u.test(description) ? "rtl" : "ltr", // تحديد الاتجاه حسب اللغة
          wordWrap: "break-word", // كسر النص إلى سطر جديد إذا تجاوز العرض
        }}
      >
        {description}
      </Typography>
   {picturePath && !videoPath && (
  <img
    alt="post"
    src={`${picturePath}`}
    style={{
      width: "100%", // العرض الأقصى 100%
      maxHeight: "400px", // ارتفاع أقصى لتفادي الطول الزائد
      objectFit: "fite", // الحفاظ على نسبة العرض إلى الارتفاع
      borderRadius: "0.75rem",
      marginTop: "0.75rem",
    }}
  />
)}


      {videoPath && (
        <video
          width="100%"
          height="auto"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          controls
          onEnded={(e) => e.target.play()}
        >
          <source
           src={`${videoPath}`}
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )}
      {audioPath && (
        <audio
          style={{
            borderRadius: "0.75rem",
            marginTop: "0.75rem",
            width: "100%",
          }}
          controls
          onEnded={(e) => e.target.play()}
        >
          <source
            src={`${audioPath}`}
            type="audio/mp3"
          />
          Your browser does not support the audio tag.
        </audio>
      )}

      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: "red" , fontSize:"25px" }} /> // Change to red when liked
              ) : (
                <FavoriteBorderOutlined sx={{ fontSize:"25px" }} />
              )}
            </IconButton>
            <Typography>{likeCount > 0 ? likeCount : ''}</Typography>
            </FlexBetween>
          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments((prev) => !prev)}>
              <ChatBubbleIcon sx={{  fontSize:"23px" }} />
            </IconButton>
            <Typography>{comments.length > 0 ? comments.length : ''}</Typography>
            </FlexBetween>
        </FlexBetween>
        
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          {comments.map((comment) => (
            <Box key={comment.commentId}>
              <Divider
                sx={{
                  marginTop: "0.5rem",
                }}
              />
              {editCommentId === comment.commentId ? (
                <Box
                  display="flex"
                  gap="0.5rem"
                  alignItems="center"
                  mt="0.5rem"
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "orange", // Change border color to orange
                        },
                        "&:hover fieldset": {
                          borderColor: "orange", // Change border color on hover to orange
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "orange", // Change border color when focused to orange
                        },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "orange", // Change button background color to orange
                      "&:hover": {
                        backgroundColor: "darkorange", // Change hover color if needed
                      },
                    }}
                    onClick={() => handleEditSubmit(comment.commentId)}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setEditCommentId(null)}
                    sx={{
                      borderColor: "#FFB74D", // Lighter orange for the initial state
                      color: "#FFB74D", // Lighter orange for the text
                      "&:hover": {
                        borderColor: "#FFCC80", // Even lighter orange on hover
                        color: "#FFCC80", // Match the text color on hover
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt="0.5rem"
                  gap="0.5rem"
                >
                  <Box display="flex" alignItems="center" gap="0.5rem">
                    <img
                      src={`${comment.picturePath}`}
                      alt={`${comment.firstName} ${comment.lastName}`}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                      }}
                    />
                    <Box>
                      <Typography sx={{ color: main, display: "flex" }}>
                        {comment.firstName} {comment.lastName} &nbsp;{" "}
                        <Box>
                          {" "}
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="span"
                          >
                            {timeAgo(comment.createdAt)}
                          </Typography>
                        </Box>
                      </Typography>
                      <span sx={{ color: main }}>{comment.comment}</span>
                    </Box>
                  </Box>
                  <FlexBetween>
                    <CommentLikeButton
                      commentId={comment.commentId}
                      postId={postId}
                      likes={comment.likes}
                    />
                    {comment.userId === loggedInUserId && (
                      <IconButton
                        onClick={(e) =>
                          handleMenuOpenComment(e, comment.commentId)
                        }
                        sx={{
                          color: "orange", // Change dots color to orange
                        }}
                      >
                        <MoreHoriz />
                      </IconButton>
                    )}
                  </FlexBetween>
                </Box>
              )}
            </Box>
          ))}
          <Divider
            sx={{
              marginTop: "0.5rem", // This is equivalent to mt-10 (2.5rem = 10 * 0.25rem)
            }}
          />
          <Box mt="1rem" display="flex" gap="0.5rem" alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              label="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              autoComplete="off" // تعطيل الإكمال التلقائي
              InputLabelProps={{
                sx: {
                  color: "orange", // تغيير لون التسمية إلى البرتقالي
                  "&.Mui-focused": {
                    color: "orange", // تغيير لون التسمية عند التركيز
                  },
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "orange", // تغيير لون الإطار إلى البرتقالي
                  },
                  "&:hover fieldset": {
                    borderColor: "orange", // تغيير لون الإطار عند التمرير إلى البرتقالي
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "orange", // تغيير لون الإطار عند التركيز إلى البرتقالي
                  },
                },
              }}
            />
            <IconButton
              sx={{
                color: "orange", // تغيير لون الأيقونة إلى البرتقالي
              }}
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()} // تعطيل الزر عندما يكون الإدخال فارغًا
            >
              <Send sx={{ color: newComment.trim() ? "orange" : "grey" }} />
            </IconButton>
          </Box>
        </Box>
      )}
      <Menu
        anchorEl={anchorElComment}
        open={Boolean(anchorElComment)}
        onClose={handleMenuCloseComment}
      >
        <MenuItem
          onClick={() => {
            const selectedComment = comments.find(
              (comment) => comment.commentId === currentCommentId
            );
            setEditComment(selectedComment.comment);
            setEditCommentId(currentCommentId);
            setAnchorElComment(null);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteComment(currentCommentId);
            setAnchorElComment(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </WidgetWrapper>
  );
};

export default PostWidget;
