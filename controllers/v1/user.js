/**
 * name : controllers/v1/user/User
 * author : Aman Kumar Gupta
 * Date : 30-Sep-2021
 * Description : User controller to process the data
 */

 const UserService = require('../../core-services/v1/user/user');

 class User {
 
     async register (req) {
         console.log('Register Triggered');
         const serviceResponse = await UserService.register();
         return serviceResponse;
     }
 
     login () {
         
     }
 };
 
 module.exports = new User();