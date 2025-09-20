// hooks/useModals.js
import { useState } from "react";

const useModals = (initialState = {}) => {
  const [modals, setModals] = useState({
    outreach: false,
    editCollege: false,
    addCollege: false,
    transfer: false,
    logs: false,
    note: false,
    ...initialState,
  });

  const openModal = (key) => {
    setModals((prev) => ({ ...prev, [key]: true }));
  };

  const closeModal = (key) => {
    setModals((prev) => ({ ...prev, [key]: false }));
  };

  return { modals, openModal, closeModal };
};

export default useModals;
