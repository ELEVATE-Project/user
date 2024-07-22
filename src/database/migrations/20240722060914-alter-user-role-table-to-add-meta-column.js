'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {
       await queryInterface.addColumn('user_roles', 'meta', {
           type: Sequelize.JSONB,
           allowNull: true,
       })
       
   },


   async down(queryInterface, Sequelize) {
       await queryInterface.removeColumn('user_roles', 'meta')
          
},
}
