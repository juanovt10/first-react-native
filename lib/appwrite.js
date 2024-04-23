import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1', // cloud version of appwrite
  platform: 'com.jsm.aora1', // bundleId
  projectId: '6627fa3d095cc1c84052', // projectId
  databaseId: '6627fc94c5bd1f710ffc', // database id
  userCollectionId: '6627fcf9aa41515bbc51', // user model Id (in database)
  videoCollectionId: '6627fd133de30db02bd9', // videos model id (in database)
  storageId: '662800695f72e1ac2d36' // files storage bucket id (in storage)
}

// Init your react-native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform) // Your application ID or bundle ID.

  // set up the new instances
  const account = new Account(client);
  const avatars = new Avatars(client);
  const databases = new Databases(client);


// this is the create user method
export const createUser = async (email, password, username) => {
  try {

    // it wil create a new account with the form fields plus an ID
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    )

    // throw an error if there the account already exists
    if(!newAccount) throw Error;

    // get the initals of the username to create avatar
    const avatarUrl = avatars.getInitials(username);

    // wait for the signIn method defined below
    await signIn(email, password);

    // Then it will create a new user in the database
    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    )

    // return the new user
    return newUser;
  } catch (err) {
    console.log(err);
    throw new Error(err)
  }  
}


// signIn method

export const signIn = async (email, password) => {
  try {
    // start a session by inputing the email and password and return the session
    const session = await account.createEmailSession(email, password)
    return session;
  } catch (err) {
    throw new Error(err);
  }
}


export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if(!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if(!currentUser) throw Error;

    return currentUser.documents[0];

  } catch (err) {
    console.log(err)
  }
}