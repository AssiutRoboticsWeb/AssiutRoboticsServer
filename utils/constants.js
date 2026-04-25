/**
 * Global Constants for Assiut Robotics Server
 */

const REGISTRATION_DEADLINE = "2026-09-27";

const MEMBER_ROLES = {
    OUTSIDE_TEAM: "outside-team",
    NOT_ACCEPTED: "not-accepted",
    MEMBER: "member",
    SUB_HEAD: "sub-head",
    HEAD: "head",
    VICE: "vice",
    LEADER: "leader",
    VICE_LEADER: "vice-leader"
};

const MESSAGE_STATUS = {
    UNREAD: "unread",
    READ: "read",
    ARCHIVED: "archived"
};

const COMMITTEES = {
    SOFTWARE: "Software",
    HR: "HR",
    OC: "OC",
    PR: "PR",
    AC_MECHANICAL: "AC-Mechanical",
    AC_ELECTRICAL: "AC-Electrical",
    MARKETING: "Marketing",
    MANAGER: "Manager"
};

const COMMON_CATEGORIES = {
    GENERAL: "General",
    MEETINGS: "Meetings",
    MANAGEMENT: "Management",
    EDUCATIONAL: "Educational",
    COMMITTEE: "Committee"
};

const JWT_EXPIRY = {
    DEFAULT: "1h",
    LONG: "48h"
};

const MEETING_CONFIG = {
    START_HOUR: 8,
    END_HOUR: 24,
    DAYS_COUNT: 7
};

const DEFAULT_AVATAR = "../all-images/default.png";

const UI_CONFIG = {
    TOAST_DURATION: 2500,
    SCROLL_THRESHOLD: 150,
    ANIMATION_DURATION: 320,
    LOGIN_REDIRECT_DELAY: 800
};

module.exports = {
    REGISTRATION_DEADLINE,
    REGISTRATION_DEADLINE,
    MEMBER_ROLES,
    MESSAGE_STATUS,
    COMMITTEES,
    COMMON_CATEGORIES,
    JWT_EXPIRY,
    MEETING_CONFIG,
    DEFAULT_AVATAR,
    UI_CONFIG
};
