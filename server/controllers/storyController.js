import imageKit from "../configs/imageKit.js";
import fs from "fs";
import Story from "../models/Story.js";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";

// Add User Story
export const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, media_type, background_color } = req.body;
    const media = req.file;

    if (!["text", "image", "video"].includes(media_type)) {
      return res.json({ success: false, message: "Invalid media type" });
    }

    let media_url = "";

    // upload media to imagekit
    if ((media_type === "image" || media_type === "video") && media) {
      const response = await imageKit.files.upload({
        file: fs.createReadStream(media.path),
        fileName: media.originalname,
      });
      media_url = imageKit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
        transformation:
          media_type === "image"
            ? [{ width: 512, quality: "auto", format: "webp" }]
            : [{ width: 720, quality: "auto" }],
      });
    }

    // create story
    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type,
      background_color,
    });

    // Schedule story deleteion after 24 hours
    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get User Stories
export const getStories = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);

    const userIds = [
      userId,
      ...(user.connections || []),
      ...(user.following || []),
    ];

    const stories = await Story.find({
      user: { $in: userIds },
    })
      .populate("user")
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
