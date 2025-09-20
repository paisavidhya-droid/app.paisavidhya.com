// client/src/context/AuthBootstrap.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authenticateUser, markInitialized, selectToken } from "../app/slices/authSlice";

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);

  useEffect(() => {
    if (token) {
      dispatch(authenticateUser());
    }else {
      // ✅ no token: we’re done bootstrapping immediately
      dispatch(markInitialized());
    }
  }, [token, dispatch]); // ✅ stable deps

  return null;
}
