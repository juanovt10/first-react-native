import { useState, useEffect } from "react";

const useAppwrite = (fn) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    fetchData();
  }, [])

  return { data }
} 

export default useAppwrite;