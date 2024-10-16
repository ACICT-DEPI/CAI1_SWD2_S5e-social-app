const Post = require("../models/Post");
const User = require("../models/User");

/* CREATE */
const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;
    const user = await User.findById(userId);

    // Extract Cloudinary URLs from uploaded files
    const picturePath = req.files.picture ? req.files.picture[0].path : null;
    const videoPath = req.files.video ? req.files.video[0].path : null;
    const audioPath = req.files.audio ? req.files.audio[0].path : null;


    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      description,
      userPicturePath: user.picturePath,
      picturePath: picturePath, 
      videoPath: videoPath,   
      audioPath: audioPath,   
      likes: {},
      comments: [],
    });

    await newPost.save();

    const post = await Post.find().sort({ createdAt: -1 }); 
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
const getFeedPosts = async (req, res) => {
  try {
      const post = await Post.find().sort({ createdAt: -1 }); 
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
      
      const post = await Post.findById(req.params.postId);

      if (!post) {
          return res.status(404).json({ message: "Post not found." });
      }

    
      if (post.userId !== req.user.id) {
          return res.status(403).json({ message: "You are not authorized to delete this post." });
      }

    
      await Post.findByIdAndDelete(req.params.postId);

      res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
      res.status(500).json({ message: "An error occurred.", error });
  }
};
const likeComment = async (req, res) => {
  const { postId, commentId } = req.params;
  const { userId } = req.body; // assuming userId comes from the request body

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find(c => c.commentId === commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Toggle like status
    if (comment.likes.has(userId)) {
      comment.likes.delete(userId); // Remove like if already liked
    } else {
      comment.likes.set(userId, true); // Add like
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  deletePost,
  likeComment,
};
