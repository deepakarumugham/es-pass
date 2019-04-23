const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  id: String,
  username: String,
  displayName: String,
  email: String
});

mongoose.model('User', userSchema, 'User');
