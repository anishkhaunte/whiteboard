
const uuid = require('uuid')
const rand = require('randomstring')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const UserSchema = new Schema({

  _id: {
    type: String,
    default: uuid.v4
  },

  first_name: {
    type: String
  },

  last_name: {
    type: String
  },

  email_address: {
    type: String
  },

  password: {
    type: String,
    default: rand.generate(8)
  },
  
  role: Number,
  write_access: Boolean
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true,
    transform (instance, doc) {
      doc.id = doc._id
      return _.omit(doc, ['_id', '__v', 'password', 'status', 'created_at', 'updated_at'])
    }
  }
})

UserSchema.virtual('type').get(function () { return _.findKey(CONST.ROLE, r => r === this.role) })

UserSchema.pre('save', function (next) {
  if (this.isModified('first_name') || this.isModified('last_name') || this.isNew) {
    this.full_name = _.truthyJoin([this.first_name, this.last_name])
  }

  if (this.isModified('password') || this.isNew) {
    return bcrypt.genSalt(10, (err, salt) => {
      if (err) { return next(err) }
      return bcrypt.hash(this.password, salt, (err, hash) => {
        if (err) { return next(err) }
        this.password = hash
        return next()
      })
    })
  } else {
    return next()
  }
})

UserSchema.methods.verifyPassword = function (password) {
  return Q.nfcall(bcrypt.compare, password, this.password)
}


module.exports = UserSchema
