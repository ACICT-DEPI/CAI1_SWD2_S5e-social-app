const User = require('../../models/User');
const Post = require('../../models/Post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const getTotalCommentsCount = async () => {
    try {
      const posts = await Post.find();
      
      const totalCommentsCount = posts.reduce((total, post) => total + post.comments.length, 0);
      
    //console.log(`total comments: ${totalCommentsCount}`);
      
      return totalCommentsCount;
    } catch (err) {
      console.error(err);
      throw new Error('Error fetching posts and calculating total comments');
    }
  };
const viewLogIn = (req, res) => {
  res.status(200).render('login');
};
const viewRegister = (req, res) => {
  res.status(200).render('register');
};
const viewDashboard = async (req, res) => {
  try {
    const users = await User.find();
    const totalUsers = await User.countDocuments(); 
    const totalPosts = await Post.countDocuments(); 
    const totalCommentsCount = await getTotalCommentsCount();


    res.render('dashboard', {
      loggedUser: req.user,
      totalUsers,
      users,
      totalPosts,
      totalCommentsCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
const viewPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).render('posts', { loggedUser: req.user,posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).render('error', { message: 'Error fetching posts', back_url: '/admin/dashboard' });
  }
};
const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    await Post.findByIdAndDelete(postId);
    res.status(200).redirect('/admin/posts');
  } catch (err) {
    res.status(500).json({ error: 'Error deleting post' });
  }
};
const showPostComments = async (req,res)=>{
  const postId = req.params.postId;
  try {
  const postComments = await Post.findById(postId).select("comments");
  console.log(postComments);  
  if(postComments){
    res.status(200).render('postComments', {loggedUser: req.user,postComments});
  }else{
    console.log("post not found");
  }
}
  catch(err){
    console.error("Error fetching post comments:", error);
  }

};
const viewUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).render('users', { loggedUser: req.user,users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).render('error', { message: 'Error fetching users', back_url: '/admin/dashboard' });
  }
};
const deleteUser = async (req,res) =>{
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    res.status(200).redirect('/admin/users');
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};

const viewProfile = async (req, res) => {
  res.render('profile', { loggedUser: req.user });
};

const viewSettings = (req, res) => {
  res.render('settings', { loggedUser: req.user });
};


const logIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).render('error', { message: 'Invalid credentials', back_url: '/admin' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('error', { message: 'Invalid credentials', back_url: '/admin' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'An error occurred, please try again later', back_url: '/admin' });
  }
};

const signUp = async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, password,superManger } = req.body;

  try {
    if (superManger !== process.env.SUPER) {
      return res.status(400).render("error", {
        message: "Invalid Super Admin Code",
        back_url: "/admin/register",
      });
    }
    // تحقق من وجود كلمة المرور
    if (!password) {
      return res.status(400).render("error", {
        message: "Password is required",
        back_url: "/admin/register",
      });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
      return res.status(400).render("error", {
        message: "This email is already in use",
        back_url: "/admin/register",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);  // تأكد من أن كلمة المرور ليست فارغة

    const adminUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      user_type: 'admin',
    });

    await adminUser.save();

    const token = jwt.sign({ id: adminUser.id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render("error", {
      message: "Something went wrong. Please try again.",
      back_url: "/admin/register",
    });
  }
};

const logOut = (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin');
};

// Export the module
module.exports = {
  viewLogIn,
  viewRegister,
  viewDashboard,
  viewPosts,
  deletePost,
  showPostComments,
  viewUsers,
  deleteUser,
  viewProfile,
  viewSettings,
  logIn,
  signUp,
  logOut,
};
