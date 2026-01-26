import imageKit from "../configs/imageKit.js"
import Post from "../models/Post.js"

export const addPost = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {content, post_type} = req.body
        const images = req.files

        let image_urls = []

        if(images.length) {
            image_urls = Promise.all(
                images.map(async(image) => {
                    const response = await imageKit.files.upload({
                    file: fs.createReadStream(image.path),
                    fileName: image.originalname,
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