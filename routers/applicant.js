const express = require('express');

const router = express.Router();

const jwt   = require('../middleware/jwt');

const applicant_controller = require('../controller/applicant_controller');

router.use(jwt.verify);

router.get('/', applicant_controller.getApplicants);

router.post('/:trackId', applicant_controller.createApplicant);
router.put('/:trackId/:memberId', applicant_controller.acceptApplicant);
router.delete('/:trackId/:memberId', applicant_controller.rejectApplicant);

module.exports = router;
