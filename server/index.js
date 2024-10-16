const express = require("express");

const cookieParser = require('cookie-parser');

const bodyParser=require('body-parser'); 
 
const cors = require("cors");

const dotenv = require("dotenv");

const multer = require("multer");

const { CloudinaryStorage } = require('multer-storage-cloudinary');

const cloudinary = require('./config/cloundinary');

const helmet = require("helmet");

const morgan = require("morgan");

const path = require("path");

const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");

const messageRouter=require("./routes/massageRouter");
const { register } = require("./controllers/auth");
const { createPost } = require("./controllers/posts");
const { verifyToken } = require("./middleware/auth");


const connectDB = require("./config/configdb");

dotenv.config({ path: "./config.env" });


const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(express.json());

app.use(helmet());

app.use(cookieParser()); 

app.use(morgan("common"));

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ["'self'"],

//     styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
//     imgSrc: ["'self'", "data:", "https://example.com", "https://res.cloudinary.com"],
//     connectSrc: ["'self'", "https://api.example.com"],
//     fontSrc: ["'self'", "https://fonts.gstatic.com"],
//     frameSrc: ["'none'"],
//     objectSrc: ["'none'"],
//     upgradeInsecureRequests: [],
//   }
// }));



app.use(cors());


app.use(express.static(path.join(__dirname, "public")));



app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



const storageForUsersPictures = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_pictures',
    allowed_formats: ['jpg', 'png',"webp"],
  },
});
const uploadForUsersPictures = multer({ storage: storageForUsersPictures });


const storageForPosts = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = '';
    if (file.mimetype.startsWith('image')) {
      folder = 'posts_images';
    } else if (file.mimetype.startsWith('video')) {
      folder = 'posts_videos';
    } else if (file.mimetype.startsWith('audio')) {
      folder = 'posts_audios';
    }

    return {
      folder,
      resource_type: file.mimetype.startsWith('image') ? 'image' : file.mimetype.startsWith('video') ? 'video' : 'raw',
      allowed_formats: ['jpg', 'png', 'mp4', 'mp3'],
    };
  },
});


const uploadForPosts = multer({ storage: storageForPosts});

app.post("/auth/register", uploadForUsersPictures.single("picture"), register);

app.post("/posts", verifyToken, uploadForPosts.fields([
  { name: 'picture', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]), createPost);




app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use('/messages', messageRouter);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT ||3000 ;

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port: ${PORT}`);
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});