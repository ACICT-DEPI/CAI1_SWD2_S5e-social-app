import { Box, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "scenes/navbar";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import UserWidget from "scenes/widgets/UserWidget";
import Loading from "scenes/Loading"; // استيراد مكون Loading

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const token = useSelector((state) => state.token);
  const currentUserId = useSelector((state) => state.user._id); // استخرج معرف المستخدم الحالي
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // Set loading to true before fetching
      try {
        const response = await axios.get(
          `http://localhost:3001/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchUser();
  }, [userId, token]);

  if (loading) {
    return <Loading />; // استخدام مكون Loading هنا
  }

  if (!user) return null;

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="1rem 5%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="1rem"
        justifyContent="space-between"
      >
        {/* Left Column */}
        <Box
          flexBasis={isNonMobileScreens ? "26%" : undefined}
          display="flex"
          flexDirection="column"
          marginBottom="2.5rem"
        >
          <UserWidget userId={userId} picturePath={user.picturePath} />
        </Box>

        {/* Center Column */}
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          display="flex"
          flexDirection="column"
          gap="0.5rem"
          maxWidth={isNonMobileScreens ? "600px" : "100%"} // تحديد حد أقصى للعرض
          width="100%"
        >
          <MyPostWidget picturePath={user.picturePath} />
          <PostsWidget userId={userId} isProfile />
        </Box>

        {/* Right Column */}
        <Box
          flexBasis={isNonMobileScreens ? "26%" : undefined}
          display="flex"
          flexDirection="column"
        >
          <FriendListWidget userId={userId} currentUserId={currentUserId} />{" "}
          {/* تمرير معرف المستخدم الحالي */}
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
