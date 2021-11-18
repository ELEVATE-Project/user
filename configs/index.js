/**
 * name : configs
 * author : Aman Kumar Gupta
 * Date : 31-Sep-2021
 * Description : Contains connections of all configs
 */

 require("./mongodb")();

 require("./kafka")();
 const path = require("path");
 const fs = require("fs");
 const requireAll = require("require-all");

 global.PROJECT_ROOT_DIRECTORY = path.join(__dirname, '..');

 //load base v1 controllers
 const pathToController = PROJECT_ROOT_DIRECTORY + "/controllers/v1/";

 fs.readdirSync(pathToController).forEach(function (file) {
   checkWhetherFolderExistsOrNot(pathToController, file);
 });

 /**
* Check whether folder exists or Not.
* @method
* @name checkWhetherFolderExistsOrNot
* @param {String} pathToFolder - path to folder.
* @param {String} file - File name.
*/

 function checkWhetherFolderExistsOrNot(pathToFolder, file) {

   let folderExists = fs.lstatSync(pathToFolder + file).isDirectory();

   if (folderExists) {
     fs.readdirSync(pathToFolder + file).forEach(function (folderOrFile) {
       checkWhetherFolderExistsOrNot(pathToFolder + file + "/", folderOrFile);
     })

   } else {
     if (file.match(/\.js$/) !== null) {
       require(pathToFolder + file);
     }
   }

 }


  // All controllers
  global.controllers = requireAll({
    dirname: PROJECT_ROOT_DIRECTORY + "/controllers",
    resolve: function (Controller) {
      return new Controller();
    }
  });