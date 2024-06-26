import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1', // cloud version of appwrite
  platform: 'com.jsm.aora1', // bundleId
  projectId: '6627fa3d095cc1c84052', // projectId
  databaseId: '6627fc94c5bd1f710ffc', // database id
  userCollectionId: '6627fcf9aa41515bbc51', // user model Id (in database)
  videoCollectionId: '6627fd133de30db02bd9', // videos model id (in database)
  storageId: '662800695f72e1ac2d36' // files storage bucket id (in storage)
}

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId,
} = config;

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
  const storage = new Storage(client);


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
      databaseId,
      userCollectionId,
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

// Get account
export const getAccount = async () => {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    throw new Error(error);
  }
}

// getCurrent user context method
export const getCurrentUser = async () => {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// method that fetches all posts
export const getAllPosts = async () => {
  try {
    // get the list of documents of the specific place (database and video collection)
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt')]
    )
    
    // return all docs
    return posts.documents;
  } catch (err) {
    throw new Error(err)
  }
}

// get latest posts
export const getLastestPosts = async () => {
  try {
    // get the list of documents of the specific place (database and video collection)
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.orderDesc('$createdAt', Query.limit(7))]
    )
    
    // return all docs
    return posts.documents;
  } catch (err) {
    throw new Error(err)
  }
}


// search posts
export const searchPosts = async (query) => {
  try {
    // get the list of documents of the specific place (database and video collection)
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.search('title', query)]
    )
    
    // return all docs
    return posts.documents;
  } catch (err) {
    throw new Error(err)
  }
}

// get user posts
export const getUserPosts = async (userId) => {
  try {
    // get the list of documents of the specific place (database and video collection)
    const posts = await databases.listDocuments(
      databaseId,
      videoCollectionId,
      [Query.equal('creator', userId), Query.orderDesc('$createdAt')]
    )
    
    // return all docs
    return posts.documents;
  } catch (err) {
    throw new Error(err)
  }
}

// signout
export const signOut = async () => {
  try {
    const session = await account.deleteSession('current');

    return session
  } catch (err) {
    throw new Error(err)
    console.log(err)
  }
}

// method to get file preview when uploading 
export const getFilePreview = async (fileId, type) => {
  let fileUrl;

  // check the type of the file and provide the specific storage method
  try {
    if (type === 'video') {
      // for video is fileView
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === 'image') {
      // for image is filePreview and the props after fileId are width, height, crop, quality
      fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100);
    } else {
      throw new Error('Invalid file type');
    }

    if(!fileUrl) throw new Error;

    return fileUrl;
  } catch (err) {
    throw new Error(err)
  }
}

// method to upload to appwrite
export const uploadFile = async (file, type) => {
  // check if there is a file
  if (!file) return;

  // destructure the file to get the mimeType
  const { mimeType, ...rest } = file;

  // fill up the asset with the right file contnetns
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.fileSize,
    uri: file.uri,
  };  
  
  try {
    // define the file to upload by providing the storage, and Id and the asset contents
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset,
    );
    
    const fileUrl = await getFilePreview(uploadedFile.$id, type);

    return fileUrl;
  } catch (err) {
    throw new Error(err)
  }
}

// method to upload to the database
export const createVideo = async (form) => {
  // try to upload the video an image 
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video'),
    ])

    // put everything in a newPost where the databse create a new document 
    // pass the databaseId and the videoCollectionId
    // the id and the contents of the document (fields)
    const newPost = await databases.createDocument(
      databaseId,
      videoCollectionId,
      ID.unique(),
      {
        title: form.title,
        prompt: form.prompt,
        creator: form.userId,
        thumbnail: thumbnailUrl,
        video: videoUrl,
      }     
    )

    return newPost;
  } catch (err) {
    throw new Error(err);
  }
}