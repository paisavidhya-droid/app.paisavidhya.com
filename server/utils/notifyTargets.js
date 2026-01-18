import User from "../models/user.model.js";

export async function getAdminIds() {
  const admins = await User.find({ role: "ADMIN" }).select("_id").lean();
  return admins.map((u) => u._id);
}

export async function getUserId(id) {
  return id ? [id] : [];
}
