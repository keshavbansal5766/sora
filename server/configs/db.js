// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     console.log("Mongo URL:", process.env.MONGODB_URL);
//     mongoose.connection.on("connected", () =>
//       console.log("Database Connected"),
//     );

//     await mongoose.connect(`${process.env.MONGODB_URL}/sora`);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing DB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "sora",
    });

    isConnected = true;
    console.log("Database Connected:", conn.connection.host);
  } catch (err) {
    console.error("DB CONNECTION ERROR:", err.message);
    throw err;
  }
};

export default connectDB;

