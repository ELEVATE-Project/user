/**
 * name : profile.js
 * author : Aman
 * created-date : 02-Nov-2021
 * Description : User Profile.
 */

// Dependencies
const profileHelper = require("../../services/helper/profile");

module.exports = class Profile {

    /**
    * @api {post} /user/v1/profile/update
    * @apiVersion 1.0.0
    * @apiName Updates User Profile
    * @apiGroup Profiles
    * @apiParamExample {json} Request-Body:
    * {
    *   "name": "Aman",
    *   "designation": [{ "value": "1", "label": "Teacher" }, { "value": "2", "label": "District Official" }],
    *   "location": [{ "value": "1", "label": "Bangalore" }],
    *   "about": "This is test about of mentee",
    *   "areasOfExpertise": [{ "value": "1", "label": "Educational Leadership" }, { "value": "2", "label": "SQAA" }],
    *   "experience": 4.2,
    *   "hasAcceptedTAndC": true, [Optional]
    *   "gender": "MALE" [Optional]
    * }
    * @apiSampleRequest /user/v1/profile/update
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Profile updated successfully",
    *   "result": []
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * Updates user profile
    * @method
    * @name update
    * @param {Object} req -request data.
    * @returns {JSON} - response data.
    */

    async update(req) {
        const params = req.body;
        try {
            const updatedProfile = await profileHelper.update(params, req.decodedToken._id);
            return updatedProfile;
        } catch (error) {
            return error;
        }
    }

    /**
    * @api {post} /user/v1/profile/details
    * @apiVersion 1.0.0
    * @apiName User Profile Details
    * @apiGroup Profiles
    * @apiParamExample {json} Request-Body:
    * {
    * }
    * @apiSampleRequest /user/v1/profile/details
    * @apiParamExample {json} Response:
    * {
    *   "responseCode": 'OK',
    *   "message": "Profile fetched successfully",
    *   "result": [
    *       {
    *            "email": {
    *                "verified": false,
    *                "address": "aman@gmail.com"
    *            },
    *            "isAMentor": false,
    *            "hasAcceptedTAndC": true,
    *            "deleted": false,
    *            "_id": "617a7250302ab95a9fc37603",
    *            "name": "Aman",
    *            "designation": [
    *                {
    *                    "value": "1",
    *                    "label": "Teacher"
    *                },
    *                {
    *                    "value": "2",
    *                    "label": "District Official"
    *                }
    *            ],
    *            "areasOfExpertise": [
    *                {
    *                    "value": "1",
    *                    "label": "Educational Leadership"
    *                },
    *                {
    *                    "value": "2",
    *                    "label": "SQAA"
    *                }
    *            ],
    *            "updatedAt": "2021-11-02T10:33:26.936Z",
    *            "createdAt": "2021-10-28T09:50:08.239Z",
    *            "__v": 0,
    *            "lastLoggedInAt": "2021-11-02T08:41:43.410Z",
    *            "about": "This is test about of mentee",
    *            "experience": "4.2",
    *            "location": [
    *                {
    *                    "value": "1",
    *                    "label": "Bangalore"
    *                }
    *            ],
    *            "gender": "MALE"
    *        }
    *   ]
    * }
    * @apiUse successBody
    * @apiUse errorBody
    */

    /**
    * User profile details
    * @method
    * @name details
    * @param {Object} req -request data.
    * @returns {JSON} - profile details.
    */

     async details(req) {
        try {
            const profileDetails = await profileHelper.details(req.decodedToken._id);
            return profileDetails;
        } catch (error) {
            return error;
        }
    }
}