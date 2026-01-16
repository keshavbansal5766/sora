import mongoose from "mongoose"

const connectionSchema = new mongoose.Schema({
    from_user_id: {type: String, ref: "User", required: true},
    to_user_id: {type: String, ref: "User", required: true},
      status: {type: String, enum: ["pending", "accepted"], default: "pending"}
}, {timeStamps: true})

const Connection = mongoose.models.Connection || mongoose.model("Connection", connectionSchema)

export default Connection