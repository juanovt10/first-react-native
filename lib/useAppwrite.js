import { useState, useEffect } from "react";
import { Alert } from "react-native";

// define custom hook
const useAppwrite = (fn) => {

  // states to place the data in and the loading parameters
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // standard fetch data function that will accept a sepcific fetch data parameter
  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      const response = await fn();
      setData(response);
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setIsLoading(false);
    }
  }
  
  // call it once
  useEffect(() => {
    fetchData();
  }, [])

  // refetch method to refresh pages 
  const refetch = () => fetchData();

  // return the data, loading state and the refetch method
  return { data, isLoading, refetch }
} 

export default useAppwrite;