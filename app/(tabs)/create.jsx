import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton';
import { ResizeMode, Video } from 'expo-av';
import { icons } from '../../constants';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { createVideo } from '../../lib/appwrite';
import { useGlobalContext } from '../../context/GlobalProvider';

const Create = () => {

  // get user from context
  const { user } = useGlobalContext();

  const [uploading, setUploading] = useState(false);

  // set form state
  const [form, setForm] = useState({
    title: '',
    video: null,
    thumbnail: null,
    prompt: '',
  });

  // this will open the file picker
  const openPicker = async (selectType) => {
    // use the expo-image-pciker to go directly to gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      aspect: [4, 3],
      quality: 1,
    });

    // restart form state in case the user does not pick anything
    if (!result.canceled) {
      if (selectType === 'image') {
        setForm({ ...form, thumbnail: result.assets[0] });
      } 
      if (selectType === 'video') {
        setForm({ ...form, video: result.assets[0] });
      } 
    }
  }

  // submit method
  const submit = async () => {
    // check that all fields are filled
    if (!form.title || !form.prompt || !form.video || !form.thumbnail) {
      return Alert.alert('Please fill in all the fields')
    }

    setUploading(true);
    
    try {

      // call the appwrite method with hte form and the user id contents
      await createVideo({
        ...form,
        userId: user.$id,
      });

      Alert.alert('Success', 'Post uploaded successfully');
      router.push('/home');

    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      //restart states
      setForm({
        title: '',
        video: null,
        thumbnail: null,
        prompt: '',
      });

      setUploading(false);
    }
  }


  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView className='px-4 my-6'>
        <Text className='text-2xl text-white font-psemibold'>
          Upload video
        </Text>

        <FormField 
          title='Video Title'
          value={form.title}
          placeholder='Give your video a catch title...'
          handleChangeText={(event) => setForm({ ...form, title: event})}
          otherStyles='mt-10'
        />

        <View className='mt-7 space-y-2'>
          <Text className='text-base text-gray-100 font-pmedium'>
            Upload Video
          </Text>

          <TouchableOpacity onPress={() => openPicker('video')}>
            {form.video ? (
              <Video 
                source={{ uri: form.video.uri }}
                className='w-full h-64 rounded-2xl'
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <View className='w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center'>
                <View className='w-14 h-14 border border-dashed border-secondary-100 justify-center items-center'>
                  <Image 
                    source={icons.upload}
                    resizeMode='contain'
                    className='w-1/2 h-1/2'
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View className='mt-7 space-y-2'>
          <Text className='text-base text-gray-100 font-pmedium'>
            Thumbnail image
          </Text>

          <TouchableOpacity onPress={() => openPicker('image')}>
            {form.thumbnail ? (
              <Image 
                source={{ uri: form.thumbnail.uri }}
                resizeMode='cover'
                className='w-full h-64 rounded-2xl'
              />
            ) : (
              <View className='w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center boder-2 border-black-200 flex-row space-x-2'>
                <Image
                  source={icons.upload}
                  resizeMode='contain'
                  className='w-5 h-5'
                />
                <Text className='text-sm text-gray-100 font-pmedium'>
                  Choose a file
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FormField 
          title='AI Prompt'
          value={form.prompt}
          placeholder='The prompt you used to create this video'
          handleChangeText={(event) => setForm({ ...form, prompt: event})}
          otherStyles='mt-7'
        />

        <CustomButton 
          title='Submit and Publish'
          handlePress={submit}
          containerStyles='mt-7'
          isLoading={uploading}
        />

      </ScrollView>
    </SafeAreaView>
  )
}

export default Create