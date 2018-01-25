
const glob = require('glob')
const path = require('path')
const express = require('express')
const router = express.Router()

// include all other route definitions
glob('**/*.js', {cwd: __dirname}, function (err, files) {
  if (err) {
    return logError(err)
  } else {
    _.without(files, path.basename(__filename)).forEach(function (file) {
      const parsed_path = path.parse(file)
      const base_route = `${path.sep}${parsed_path.name}`
      // console.log "Loading route (#{ base_route }) definition: #{ file }"
      return router.use(base_route, require(`${__dirname}${path.sep}${file}`))
    })
    return console.log('Loaded routes.')
  }
})

module.exports = router
