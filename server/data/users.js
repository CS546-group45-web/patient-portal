const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const events = mongoCollections.events;
const events_func = require('./events');
const validation = require('../utils/validation');

const createUser = async (
  firstName,
  lastName,
  email,
  username,
  password,
  phone,
  dob,
  gender
) => {
  firstName = validation.checkNames(firstName, 'firstName');
  lastName = validation.checkNames(lastName, 'lastName');
  email = validation.checkEmail(email);
  username = validation.checkUsername(username);
  dob = validation.checkDate(dob);
  phone = validation.checkPhone(phone);
  password = validation.checkPassword(password);
  gender = validation.checkGender(gender);

  const user_collection = await users();
  hashed_password = await bcrypt.hash(password, 10);

  const newuUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    username: username,
    dob: dob,
    phone: phone,
    hashed_password: hashed_password,
    gender: gender,
    is_verified: false,
    invited_events: [],
    rsvped_events: [],
    profile_photo_url: '',
    events_created: [],
    followers: [],
    following: [],
  };

  const insertInfo = await user_collection.insertOne(newuUser);
  if (insertInfo.insertedCount === 0) throw 'Could not add user';
  const newId = insertInfo.insertedId;
  return newId;
};

const getUserById = async (id) => {
  const user_collection = await users();
  const user = await user_collection.findOne({ _id: ObjectId(id) });
  if (!user) throw 'User not found';
  user._id = user._id.toString();
  delete user.hashed_password;
  return user;
};

const getUserById_Object = async (id) => {
  const user_collection = await users();
  const user = await user_collection.findOne({ _id: ObjectId(id) });
  if (!user) throw 'User not found';
  user._id = user._id.toString();
  delete user.hashed_password;
  return user;
};

const getEventById_Object = async (event_id) => {
  event_id = validation.checkObjectId(event_id);
  const eventCollection = await events();
  const event = await eventCollection.findOne({ _id: ObjectId(event_id) });
  if (event === null) throw new Error("No event with that id");
  return event;
};

const getUserByEmail = async (email) => {
  email = validation.checkEmail(email);
  const user_collection = await users();
  const user = await user_collection.findOne({ email });
  if (!user) throw 'User not found';
  user._id = user._id.toString();
  return user;
};

const updateUser = async (
  id,
  firstName,
  lastName,
  email,
  username,
  phone,
  dob,
  gender
) => {
  validation.checkObjectId(id);
  const user_collection = await users();
  firstName = validation.checkNames(firstName, 'firstName');
  lastName = validation.checkNames(lastName, 'lastName');
  email = validation.checkEmail(email);
  username = validation.checkUsername(username);
  dob = validation.checkDate(dob);
  phone = validation.checkPhone(phone);
  gender = validation.checkGender(gender);

  const updatedUser = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    username: username,
    dob: dob,
    phone: phone,
    gender: gender,
  };

  const updatedInfo = await user_collection.updateOne(
    { _id: ObjectId(id) },
    { $set: updatedUser }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update user successfully';
  }

  return await getUserById(id);
};

const getAllUsers = async () => {
  const userCollection = await users();
  const users_list = await userCollection.find({}).toArray();
  if (!users_list) {
    throw new Error("Could not get all events.");
  }
  for (const element of users_list) {
    element._id = element._id.toString();
  }
  return users_list; //changed from events to event_list
};

const verifyUser = async (id) => {
  const user_collection = await users();
  const updatedInfo = await user_collection.updateOne(
    { _id: ObjectId(id) },
    { $set: { is_verified: true } }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update user successfully';
  }
  return await getUserById(id);
};

const updateUserPassword = async (id, password) => {
  const user_collection = await users();
  password = validation.checkPassword(password);
  hashed_password = await bcrypt.hash(password, 10);
  const updatedInfo = await user_collection.updateOne(
    { _id: ObjectId(id) },
    { $set: { hashed_password: hashed_password } }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update user successfully';
  }
  return await getUserById(id);
};

const getUserByUsername = async (username) => {
  const user_collection = await users();
  const user = await user_collection.findOne({
    username: username,
  });
  if (!user) throw 'User not found';
  user._id = user._id.toString();
  delete user.hashed_password;
  return user;
};

const addFollower = async (userId, followerId) => {
  const user_collection = await users();
  const updatedInfo = await user_collection.updateOne(
    { _id: ObjectId(followerId) },
    { $addToSet: { followers: userId } }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update user successfully';
  }

  const updatedInfo2 = await user_collection.updateOne(
    { _id: ObjectId(userId) },
    { $addToSet: { following: followerId } }
  );
  if (updatedInfo2.modifiedCount === 0) {
    throw 'could not update user successfully';
  }
  return await getUserById(userId);
};

const unfollowUser = async (userId, followerId) => {
  const user_collection = await users();
  const updatedInfo = await user_collection.updateOne(
    { _id: ObjectId(followerId) },
    { $pull: { followers: userId } }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update user successfully';
  }
  const updatedInfo2 = await user_collection.updateOne(
    { _id: ObjectId(userId) },
    { $pull: { following: followerId } }
  );
  if (updatedInfo2.modifiedCount === 0) {
    throw 'could not update user successfully';
  }
  return await getUserById(userId);
};

const updateImageURL = async (userId, imageURL) => {
  const user_collection = await users();
  const updatedInfo = await user_collection.updateOne(
    { _id: ObjectId(userId) },
    { $set: { profile_photo_url: imageURL } }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw 'could not update user successfully';
  }
  return await getUserById(userId);
};

const getFollowersInformation = async (userId) => {
  const user_collection = await users();
  const user = await user_collection.findOne({ _id: ObjectId(userId) });
  if (!user) throw 'User not found';
  const followers = [];
  for (let i = 0; i < user.followers.length; i++) {
    const follower = await getUserById(user.followers[i]);
    followers.push(follower);
  }
  return followers;
};

const getFollowingInformation = async (userId) => {
  const user_collection = await users();
  const user = await user_collection.findOne({ _id: ObjectId(userId) });
  if (!user) throw 'User not found';
  const following = [];
  for (let i = 0; i < user.following.length; i++) {
    const follower = await getUserById(user.following[i]);
    following.push(follower);
  }
  return following;
};
const add_event = async(userId, event_id) => {
  const user_collection = await users();
  const event = await events_func.getEventById(event_id);
  const updated_info = await user_collection.updateOne(
    {_id : ObjectId(userId)},
    {$push : {invited_events : event}},
    {returnDocument: "after"}
  )
  if(updated_info.modifiedCount ===0){
    throw 'Could not add invited event to user successfully';
  }
  return await getUserById(userId);
}

const rsvp_event = async(userId, eventId) =>{
  eventId = validation.checkObjectId(eventId);
  userId = validation.checkObjectId(userId);
  const user_collection = await users();
  const user = await user_collection.findOne(
    {"invited_events._id" : ObjectId(eventId)}
  );
  if(user === null) throw 'No events with given Id for this user';
  const updated_info = await user_collection.updateOne(
    {_id : ObjectId(userId)},
    {$pull : {invited_events: {_id: ObjectId(eventId)}}},
    {returnDocument: "after"}
  );
  if(updated_info.modifiedCount === 0){
    throw 'Could not rsvp user to event successfully';
  }
  const event = await getEventById_Object(eventId);
  const updated_info_after = await user_collection.updateOne(
    {_id : ObjectId(userId)},
    {$push : {rsvped_events: event}},
    {returnDocument: "after"}
  );
  if(updated_info_after.modifiedCount === 0){
    throw 'Could not rsvp user to event successfully';
  }
  await user_rsvped(userId,eventId);
  return await getUserById(userId);
}

const user_rsvped = async (userId, eventId) => {
  eventId = validation.checkObjectId(eventId);
  userId = validation.checkObjectId(userId);
  const event_collection = await events();
  const event = await event_collection.findOne(
    {"waitlist._id" : ObjectId(userId)}
  );
  if(event === null) throw 'No user with given id';
  const user = await getUserById_Object(userId);
  const updated_info = await event_collection.updateOne(
    {_id : ObjectId(eventId)},
    {$pull: {waitlist : {_id : ObjectId(userId)}}},
    {returnDocument : "after"}
  );
  if(updated_info.modifiedCount === 0){
    throw 'Could not add user to rsvps list.';
  }
  const updated_info_after = await event_collection.updateOne(
    {_id : ObjectId(eventId)},
    {$push: {rsvps : user}},
    {returnDocument : "after"}
  );
  if(updated_info_after.modifiedCount === 0){
    throw 'Could not add user to rsvps list.';
  }
  return {"User rsvped" : "user_rsvp successfully rsvped."};
}

const user_create_event = async(userId, created_event) =>{
  const user_collection = await users();
  const updated_info = await user_collection.updateOne(
    {_id : ObjectId(userId)},
    {$push : {events_created : created_event}},
    {returnDocument: "after"}
  );
  if(updated_info.modifiedCount === 0){
    throw 'Could not add created event to user successfully';
  }
  return await getUserById(userId);
}


module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  verifyUser,
  updateUserPassword,
  getUserByUsername,
  addFollower,
  unfollowUser,
  updateImageURL,
  getFollowingInformation,
  getFollowersInformation,
  add_event,
  rsvp_event,
  user_create_event,
};
