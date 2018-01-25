/*
Environment Specific Configuration
==================================
Development : ./config/development.json
Staging     : ./config/staging.json
Production  : ./config/production.json
All the configuration files are git ignored, when ever you do configuration
change, please update in template.json
*/

const env = (process.env.NODE_ENV || 'development').toLowerCase()
const config = require(`${__projectdir}../config/${env}`)
config.env = env

module.exports = config
