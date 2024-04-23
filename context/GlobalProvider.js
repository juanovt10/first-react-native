import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../lib/appwrite";

// define the global context by creatingContext method
const GlobalContext = createContext();

// export tthe useGlobalcontext
export const useGlobalContext = () => useContext(GlobalContext);

// define the global provider
const GlobalProvider = ({ children }) => {

  // all the states 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // the use effect gets the current user
  // if there is a response change the states
  // if there is no response keep the states how they are
  // fianlly turn off the is loading off
  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if(res) {
          setIsLoggedIn(true);
          setUser(res)
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setIsLoading(false);
      })
  }, [])

  // this will return the global provider
  // add the value prop with an object with all the necessary states
  return (
    <GlobalContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        isLoading
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
} 

export default GlobalProvider;
