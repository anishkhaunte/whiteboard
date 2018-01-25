const { Schema } = require('mongoose')

const SessionSchema = new Schema({

  token: {
    type: String,
    required: true
  },

  user: {
    type: String,
    ref: 'User'
  },

  status: {
    type: Number,
    default: CONST.DB_RECORD.ACTIVE
  }

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

SessionSchema.pre('save', function (next) {
  this.updated_at = new Date()
  return next()
})

module.exports = SessionSchema
