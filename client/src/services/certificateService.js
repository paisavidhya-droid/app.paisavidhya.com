import axiosInstance from "../api/axios";

const BASE = "/api/certificates";

export const verifyCertificate = async (certificateId) => {
  const { data } = await axiosInstance.get(`${BASE}/${encodeURIComponent(certificateId)}`);
  return data;
};
