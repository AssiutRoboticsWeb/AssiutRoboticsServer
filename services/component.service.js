const Component = require('../models/component');
const Member = require('../models/member');
const fs = require('fs');
const path = require('path');
const sendEmail = require('../utils/sendEmail');
const createError = require('../utils/createError');
const httpStatusText = require('../utils/httpStatusText');
const { MEMBER_ROLES, COMMITTEES } = require('../utils/constants');
const { uploadToCloud } = require('../utils/cloudinary');

const createComponent = async (data, file, creatorEmail) => {
    const member = await Member.findOne({ email: creatorEmail });
    if (!member) {
        throw createError(400, httpStatusText.FAIL, "Creator member not found");
    }

    let imageUrl = '';
    if (file) {
        imageUrl = await uploadToCloud(file.path);
    } else {
        throw createError(400, httpStatusText.FAIL, "Image is required for component");
    }

    const { title, price, taxes, ads, discount, total, category } = data;

    const newComponent = new Component({
        title,
        image: imageUrl,
        price,
        taxes,
        ads,
        discount,
        total,
        category,
        creation: {
            createdBy: member._id,
            createdAt: Date.now()
        }
    });

    await newComponent.save();
    return newComponent;
};

const updateComponent = async (id, updateData, updaterEmail) => {
    const member = await Member.findOne({ email: updaterEmail });
    if (!member) {
        throw createError(400, httpStatusText.FAIL, "Member not found");
    }

    const component = await Component.findById(id);
    if (!component) {
        throw createError(404, httpStatusText.FAIL, "Component not found");
    }

    Object.assign(component, updateData);
    component.historyOfUpdate.push({
        updatedBy: member._id,
        updatedAt: Date.now()
    });

    await component.save();
    return component;
};

const deleteComponent = async (id, deleterEmail) => {
    const member = await Member.findOne({ email: deleterEmail });
    if (!member) {
        throw createError(400, httpStatusText.FAIL, "Member not found");
    }

    const component = await Component.findById(id);
    if (!component) {
        throw createError(404, httpStatusText.FAIL, "Component not found");
    }

    component.deleted = true;
    component.deletedBy = member._id;
    await component.save();
    return component;
};

const sendBorrowNotification = async (memberEmail, componentId) => {
    try {
        const member = await Member.findOne({ email: memberEmail });
        const component = await Component.findById(componentId);

        let sendTo = [];

        // Notify Leaders
        const leaders = await Member.find({ role: MEMBER_ROLES.LEADER }, { email: 1 });
        leaders.forEach(l => sendTo.push(l.email));

        // Notify OC Committee
        const ocMembers = await Member.find({ committee: COMMITTEES.OC }, { email: 1 });
        ocMembers.forEach(oc => sendTo.push(oc.email));

        let htmlTemplate = fs.readFileSync(path.join(__dirname, '../public/notificationRequestToBorrow.html'), 'utf8');

        htmlTemplate = htmlTemplate
            .replace('{{name}}', member.name)
            .replace('{{email}}', member.email)
            .replace('{{committee}}', member.committee)
            .replace('{{phoneNumber}}', member.phoneNumber)
            .replace('{{avatar}}', member.avatar)
            .replace('{{componentName}}', component.title)
            .replace('{{category}}', component.category)
            .replace('{{componentImage}}', component.image);

        // Send emails
        sendTo.forEach(async email => {
            await sendEmail({
                email,
                subject: "Request to Borrow - Assiut Robotics",
                text: "Component Borrow Request",
                html: htmlTemplate
            });
        });
    } catch (err) {
        console.error("Failed to send borrow notification: ", err.message);
    }
};

const requestBorrow = async (componentId, requesterEmail) => {
    const member = await Member.findOne({ email: requesterEmail });
    if (!member) throw createError(400, httpStatusText.FAIL, "Member not found");

    const component = await Component.findById(componentId);
    if (!component) throw createError(404, httpStatusText.FAIL, "Component not found");

    if (component.borrowedBy) throw createError(400, httpStatusText.FAIL, "Component is already borrowed");
    if (component.requestToBorrow) throw createError(400, httpStatusText.FAIL, "Component is already requested by someone else");

    component.requestToBorrow = member._id;
    await component.save();

    // Fire & forget notification
    sendBorrowNotification(member.email, component._id);

    return component;
};

const processBorrowRequest = async (componentId, approverEmail, action, borrowDate, deadlineDate) => {
    const approver = await Member.findOne({ email: approverEmail });
    if (!approver) throw createError(400, httpStatusText.FAIL, "Approver not found");

    const component = await Component.findById(componentId);
    if (!component) throw createError(404, httpStatusText.FAIL, "Component not found");

    if (!component.requestToBorrow) throw createError(400, httpStatusText.FAIL, "No active borrow requests for this component");

    if (action === 'accept') {
        if (!borrowDate || !deadlineDate) {
            throw createError(400, httpStatusText.FAIL, "borrowDate and deadlineDate are required to accept");
        }
        component.borrowedBy = {
            member: component.requestToBorrow,
            borrowDate,
            deadlineDate,
            acceptedBy: approver._id
        };
        component.requestToBorrow = null;
    } else if (action === 'reject') {
        component.requestToBorrow = null;
    } else {
        throw createError(400, httpStatusText.FAIL, "Invalid action. Use 'accept' or 'reject'");
    }

    await component.save();
    return component;
};

const returnComponent = async (componentId, returnerEmail) => {
    const returner = await Member.findOne({ email: returnerEmail });
    if (!returner) throw createError(400, httpStatusText.FAIL, "Member not found");

    const component = await Component.findById(componentId);
    if (!component) throw createError(404, httpStatusText.FAIL, "Component not found");

    if (!component.borrowedBy) {
        throw createError(400, httpStatusText.FAIL, "Component is not currently borrowed");
    }

    const returnDate = new Date();

    component.history.push({
        member: component.borrowedBy.member,
        acceptedBy: component.borrowedBy.acceptedBy,
        borrowDate: component.borrowedBy.borrowDate,
        deadlineDate: component.borrowedBy.deadlineDate,
        returnDate: returnDate,
        returnBy: returner._id
    });

    component.borrowedBy = null;
    await component.save();

    return component;
};

module.exports = {
    createComponent,
    updateComponent,
    deleteComponent,
    requestBorrow,
    processBorrowRequest,
    returnComponent
};
