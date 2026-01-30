import imageKit from "../configs/imageKit.js";
import Message from "../models/Message.js";

// Create an empty object to store ss Event connections
const connections = {};

// Controller function for the SSE endpoint
export const sseController = (req, res) => {
  const { userId } = req.params;

  console.log("New Client Connected: ", userId);

  //   Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  //   Add the client's response object to the connections object
  connections[userId] = res;

  //   Send an initial event to the client
  res.write("log: Connected to SSE stream\n\n");

  //   Handle client disconnection
  req.on("close", () => {
    // Remove the client's response object from the connections array
    delete connections[userId];
    console.log("Client disconnected");
  });
};

// Send Message
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id, text } = req.body;
    const image = req.file;

    let media_url = "";
    let message_type = image ? "image" : "text";

    if (message_type === "image") {
      const response = await imageKit.files.upload({
        file: fs.createReadStream(image.path),
        fileName: image.originalname,
      });

      media_url = imageKit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
        transformation: [{ width: 1280, quality: "auto", format: "webp" }],
      });
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    res.json({ success: true, message });

    // Send message to to_user_id using SSE
    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id",
    );

    if(connections[to_user_id]) {
        connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
    }
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
