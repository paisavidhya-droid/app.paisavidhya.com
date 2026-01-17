// src/hooks/useAuth.js
import { useDispatch, useSelector } from "react-redux";
import {
  selectToken,
  selectUser,
  selectIsFetching,
  selectIsLoggedIn,
  storeToken,
  logout,
  authenticateUser,
  selectInitialized, 
} from "../app/slices/authSlice";
import { useCallback } from "react";

export const useAuth = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const isFetching = useSelector(selectIsFetching);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const initialized = useSelector(selectInitialized);
  const BASE_URL = import.meta.env.VITE_API_SERVER_URL;


  // stable action helpers (good for useEffect deps)
  const storeTokenInLS = useCallback(
    (t) => dispatch(storeToken(t)),
    [dispatch]
  );

  const LogoutUser = useCallback(
    () => dispatch(logout()),
    [dispatch]
  );

  const authenticateUserCb = useCallback(
    () => dispatch(authenticateUser()),
    [dispatch]
  );

  const isAdmin =
  user?.role === "ADMIN" ||
  user?.isAdmin === true;



  return {
    token,
    user,
    isAdmin,
    isFetching,
    isLoggedIn,
    BASE_URL,
    storeTokenInLS,
    LogoutUser,
    initialized,
    authenticateUser: authenticateUserCb,
  };
};
