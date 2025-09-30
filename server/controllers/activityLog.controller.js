const activityLogModel = require("../models/activityLogModel");
// this is not being used anywhere in paisavidhya
// controllers/activityLog.controller.js
exports.getActivityLogs = async (req, res, next) => {
  const { modelType, modelId } = req.params;
  try {
      const query = {};
    if (modelType) query.modelType = modelType;
    if (modelId) query.modelId = modelId;

    const logs = await activityLogModel.find(query)
      .populate("changedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.log(error);
    next(error)

    // res.status(500).json({ message: "Failed to fetch logs", error: error.message });
  }
};
