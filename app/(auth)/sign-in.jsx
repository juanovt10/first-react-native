import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router'
import { getCurrentUser, signIn } from '../../lib/appwrite'
import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [isSubmitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);

    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLoggedIn(true);

      Alert.alert("Success", "User signed in successfully");
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // const submit = async () => {
  //   if(!form.email || !form.password) {
  //     Alert.alert('Error', 'Please fill in all the fields')
  //   }
    
  //   setIsSubmitting(true);
  //   try {
  //     // check for the sign in
  //     await signIn(form.email, form.password);

  //     // then get the result by accessing the context provider
  //     const result = await getCurrentUser();

  //     // set up the provider states
  //     setUser(result);
  //     setIsLogged(true);

  //     router.replace('/home')
  //   } catch (err) {
  //     Alert.alert('Error', err.message);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // }


  return (
    <SafeAreaView className='bg-primary h-full'>
      <ScrollView>
        <View className='w-full flex justify-center min-h-[83vh] px-4 my-6'>
          <Image 
            source={images.logo}
            resizeMode='contain'
            className='w-[115px] h-[34px]'
          />

          <Text className='text-2xl text-white text-semibold mt-10 font-psemibold'>
            Log in to Aora
          </Text>

          <FormField 
            title='Email'
            value={form.email}
            handleChangeText={(event) => setForm({...form, email: event})}
            otherStyles='mt-7'
            keyboardType='email-address'
          />
          <FormField 
            title='Password'
            value={form.password}
            handleChangeText={(event) => setForm({...form, password: event})}
            otherStyles='mt-7'
          />

          <CustomButton 
            title='Sign In'
            handlePress={submit}
            containerStyles='mt-7'
            isLoading={isSubmitting}
          />

          <View className='justify-center pt-5 flex-row gap-2'>
            <Text className='text-lg text-gray-100 font-pregular'>
              Don't have an account
            </Text>
            <Link href='/sign-up' className='text-lg font-psemibold text-secondary'>
              Sign up
            </Link>

          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  )
}

export default SignIn