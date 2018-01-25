
const uuid = require('uuid')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const UserRequestSchema = new Schema({

  _id: {
    type: String,
    default: uuid.v4
  },

  email_address: {
    type: String
  },

  user_id :{
    type: String,
    ref: 'User'
  },

  approval_status: {
    type: Number,
    default: CONST.APPROVAL_TYPE.PENDING
  },

  request_timestamp: Date,
  
  approval_timestamp: Date
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
      doc.customer_type = _.findKey(CONST.CUSTOMER_TYPE, t => t === doc.customer_type)
      return _.omit(doc, ['_id', '__v', 'password', 'otp', 'status', 'created_at', 'updated_at'])
    }
  }
})

module.exports = UserRequestSchema
