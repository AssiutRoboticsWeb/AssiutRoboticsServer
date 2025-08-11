require('dotenv').config();
const PORT = process.env.PORT;

const express = require("express");
const app = express();

// Routers
const memberRouter = require('./routers/member.router')
const blogRouter = require('./routers/blog.router')
const componentRouter = require('./routers/component.router')
const lapDateRouter = require('./routers/lapDates.js')
const visitRouter = require('./routers/visit.js')
const announcementRouter = require('./routers/announcement');
const meetingRouter = require('./routers/meeting');
const guestRouter = require('./routers/guest.js');
const webhookRoutes = require('./routers/webhook.router.js');
const trackRouter = require('./routers/track.js');
const courseRouter = require('./routers/course.js');


// Utils
const httpStatusText = require('./utils/httpStatusText');

// Middleware
const cors = require('cors');
app.use(cors());

const body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));



app.set('view engine', 'ejs');

// ✅ توصيل المسارات هنا
app.use("/members", memberRouter);
app.use("/blogs", blogRouter);
app.use("/components", componentRouter);
app.use("/lap-dates", lapDateRouter);
app.use("/visits", visitRouter);     
app.use("/announcements", announcementRouter);
app.use("/meetings", meetingRouter);
app.use("/guests", guestRouter);
app.use("/webhooks", webhookRoutes);
app.use("/tracks", trackRouter);
app.use("/courses", courseRouter);


// Default route (اختياري لو حابة تضيفي مسار أساسي)
app.get("/", (req, res) => {
    res.send("API is working ✅");
});

app.post("/test", (req, res) => {
    res.send("POST route works ✅");
});

app.use("/",(req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Not Found api route"
    });
});

app.use(function (err,req, res,next) {
    console.log(err.message);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


