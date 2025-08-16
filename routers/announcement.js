const express = require("express");

const Router = express.Router();

const announcementController = require("../controller/announcement.controller");

const jwt = require("../middleware/jwt");

// إضافة إعلان
Router.route("/add").post(jwt.verify, announcementController.addAnnouncement);

// جلب كل الإعلانات
Router.route("/getAnnouncements")
        .get(announcementController.getAnnouncements);

// جلب إعلانات تراك محدد
Router.route("/track/:trackId")
        .get(announcementController.getTrackAnnouncements);

// إرسال إعلان لأعضاء التراك كرسائل
Router.route("/track-message")
        .post(jwt.verify, announcementController.sendTrackAnnouncementToMembers);

// تعديل وحذف إعلان
Router.route("/:id")
        .delete(announcementController.deleteAnnouncement)
        .put(announcementController.updateAnnouncement);

module.exports = Router;