// controllers/ucc.controller.js
import { createUccForUser, getUccRecordsForUser } from '../services/ucc.service.js';

export const createUcc = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const overrides = req.body || {};
    const result = await createUccForUser(userId, overrides);

    res.status(201).json({
      message: 'UCC request sent to BSE',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getUccByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const records = await getUccRecordsForUser(userId);
    res.json({ records });
  } catch (err) {
    next(err);
  }
};
