import imageKit from "../configs/imageKit.js"
import Post from "../models/Post.js"
import fs from "fs"
import User from "../models/User.js"

export const addPost = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {content, post_type} = req.body
        const images = req.files
        let image_urls = []

        if(images.length) {
            image_urls = await Promise.all(
                images.map(async(image) => {
                    const response = await imageKit.files.upload({
                    file: fs.createReadStream(image.path),
                    fileName: image.originalname,
                    folder: "posts"
                    });
                    const url = imageKit.helper.buildSrc({
                        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                        src: response.filePath,
                        transformation: [{ width: 512, quality: "auto", format: "webp" }],
                    });
                    return url
                })
            ) 
        }

        await Post.create({
            user: userId,
            content,
            image_urls,
            post_type
        })

        res.json({success: true, mesaage: "Post created successfully"})
    }  catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

// Get Posts
export const getFeedPosts = async (req, res) => {
    try {
        const {userId} = req.auth()
        const user = await User.findById(userId)

        // User connections and followings
        const userIds = [userId, ...(user.connections || []), ...(user.following || [])]
        const posts = await Post.find({user: {$in: userIds}}).populate("user").sort({createdAt: -1}).limit(20)
        res.json({success: true, posts})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}


// Like Post
export const likePost = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {postId} = req.body

        const post = await Post.findById(postId).select("likes_count")
        if (!post) {
        return res.json({ success: false, message: "Post not found" })
        }

        const isLiked = post.likes_count.includes(userId)

        await Post.findByIdAndUpdate(
        postId,
        isLiked
            ? { $pull: { likes_count: userId } }
            : { $addToSet: { likes_count: userId } }
        )

        res.json({
        success: true,
        message: isLiked ? "Post unliked" : "Post liked"
        })
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message})
    }
}

