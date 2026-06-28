// import express from 'express';

// import cors from "cors"
// import cookieParser from "cookie-parser"

// import dotenv from 'dotenv'
//  dotenv.config({
//     path: './.env'
// })

// const app = express();

// if (!process.env.CORS_ORIGIN) {
   
//     console.warn("⚠️  CORS_ORIGIN not defined in .env");
// }//warning 

// app.use(cors({
//     origin:process.env.CORS_ORIGIN,
//     credentials:true
// })) 

// app.use(express.json({limit: "16kb"})) 

// app.use(express.urlencoded({extended: true , limit:"16kb"}))  

// app.use(express.static("public")) 

// app.use(cookieParser())  


// //routes declaration

// import userRouter from './routes/user.routes.js'

// app.use("/api/v1/user",userRouter)

// import familyRouter from './routes/family.routes.js'

// app.use("/api/v1/family" , familyRouter);


// import contentRouter  from './routes/content.routes.js'

// app.use("/api/v1/content" , contentRouter);

// import privateGrouprouter from './routes/privategroup.routes.js'
// app.use("/api/v1/private-group",privateGrouprouter )




// import pdfRoutes from "./routes/pdf.routes.js"

// app.use("/api/v1/pdf",pdfRoutes);

// // for video call notification
// import callRouter from "./routes/call.notification.route.js"
// app.use("/api/v1/notification", callRouter);

// import Generatenotification from "./routes/notification.routes.js"
// app.use("/api/v1", Generatenotification)
// //////// To be removed


// // test Postgres connection
// app.get('/ping-postgres', async (req, res) => {
//   try {
//     const [result] = await sequelize.query('SELECT NOW() as now;');
//     res.json({ status: "✅ PostgreSQL connected", time: result[0].now });
//   } catch (err) {
//     res.status(500).json({ status: "❌ PostgreSQL error", error: err.message });
//   }
// });

// // test Mongo (just to confirm server runs)
// app.get('/ping', (req, res) => {
//   res.send("✅ Server + Mongo is running!");
// });


// /////////////////////////////////////





// app.get("/", (req, res) => {
//     res.send("Famly backend is live 🚀");
// });

// app.use((err, req, res, next) => {
//     console.error("🔥 Global Error Handler: ", err);
//     res.status(err.statusCode || 500).json({
//         success: false,
//         message: err.message || "Internal Server Error"
//     });
// }); // sare errors ko handle karne ke liye




// export {app}




// new code with video call notification support

import express from 'express';

import cors from "cors"
import cookieParser from "cookie-parser"

import dotenv from 'dotenv'
 dotenv.config({
    path: './.env'
})

const app = express();

if (!process.env.CORS_ORIGIN) {
   
    console.warn("⚠️  CORS_ORIGIN not defined in .env");
}//warning 

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
})) 

app.use(express.json({limit: "16kb"})) 

app.use(express.urlencoded({extended: true , limit:"16kb"}))  

app.use(express.static("public")) 

app.use(cookieParser())  


//routes declaration

import userRouter from './routes/user.routes.js'

app.use("/api/v1/user",userRouter)

import familyRouter from './routes/family.routes.js'

app.use("/api/v1/family" , familyRouter);


import contentRouter  from './routes/content.routes.js'

app.use("/api/v1/content" , contentRouter);

import privateGrouprouter from './routes/privategroup.routes.js'
app.use("/api/v1/private-group",privateGrouprouter )




import pdfRoutes from "./routes/pdf.routes.js"

app.use("/api/v1/pdf",pdfRoutes);

// for video call notification
import callRouter from "./routes/call.notification.route.js"
app.use("/api/v1/notification", callRouter);

import Generatenotification from "./routes/notification.routes.js"
app.use("/api/v1", Generatenotification)
//////// To be removed


// test Postgres connection
app.get('/ping-postgres', async (req, res) => {
  try {
    const [result] = await sequelize.query('SELECT NOW() as now;');
    res.json({ status: "✅ PostgreSQL connected", time: result[0].now });
  } catch (err) {
    res.status(500).json({ status: "❌ PostgreSQL error", error: err.message });
  }
});

// test Mongo (just to confirm server runs)
app.get('/ping', (req, res) => {
  res.send("✅ Server + Mongo is running!");
});


/////////////////////////////////////





app.get("/", (req, res) => {
    res.send("Famly backend is live 🚀");
});

app.use((err, req, res, next) => {
    console.error("🔥 Global Error Handler: ", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
}); // sare errors ko handle karne ke liye




export {app}