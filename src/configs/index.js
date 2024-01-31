/**
 * name : configs
 * author : Aman Kumar Gupta
 * Date : 31-Sep-2021
 * Description : Contains connections of all configs
 */

//Dependencies
require('./kafka')()
require('./cache')()
require('./aes256cbc')()
require('./bull')()
const path = require('path')

global.PROJECT_ROOT_DIRECTORY = path.join(__dirname, '..')
