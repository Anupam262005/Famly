
// import mongoose from 'mongoose';
// import { DB_NAME } from '../constants.js';
// import { Sequelize } from 'sequelize';


// let sequelize; // Postgres instance

// const connectDB= async ()=>{
//     try{
//         //------------------------MongoDB connection------------

//         const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`MongoDB connected! DB Host: ${connectionInstance.connection.host} `)

//         // ---------- PostgreSQL Connection ----------

//     sequelize = new Sequelize(process.env.DATABASE_URL, {
//       dialect: 'postgres',
//       logging: false,
//     });

//     await sequelize.authenticate();
//     console.log('PostgreSQL connected!');
//     }
//     catch(error){
//         console.log("MongoDB connectionr failed: ",error);
//         process.exit(1); 
//     }
// }

// export {connectDB,sequelize};


import mongoose from "mongoose";
import { Sequelize } from "sequelize";


export const connectMongo = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
};

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected!");
  } catch (err) {
    console.error("PostgreSQL connection failed:", err);
    process.exit(1);
  }
};
