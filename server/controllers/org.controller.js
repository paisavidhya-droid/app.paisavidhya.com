// server/controllers/org.controller.js
import Org from "../models/org.model.js";
import slugify from "slugify";

function generateShortCode(name) {
  const base = name
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 5);
  const rand = Math.floor(Math.random() * 900 + 100); // 3 digits
  return `PV-${base}${rand}`;
}

// CREATE
export const createOrg = async (req, res, next) => {
  try {
    const { name, shortCode, ...safeBody } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const slug =
      slugify(name, { lower: true, strict: true }) +
      "-" +
      Math.random().toString(36).slice(2, 6);

    // const shortCode = generateShortCode(name); it creates short code immediatly after org creation

    const org = await Org.create({
      ...safeBody,
      name,
      slug,
      // shortCode: generated later via dedicated endpoint
      createdBy: req.user.id,
    });

    res.status(201).json(org);
  } catch (err) {
    next(err);
  }
};

export const generateOrgPledgeLink = async (req, res, next) => {
  try {
    const { id } = req.params;
    const org = await Org.findById(id);

    if (!org) {
      return res.status(404).json({ message: "Org not found" });
    }

    if (!org.isActive) {
      return res
        .status(400)
        .json({ message: "Cannot generate link for inactive org" });
    }

    if (org.shortCode) {
      // already has a link – just return it
      return res.json(org);
    }

    const shortCode = generateShortCode(org.name);

    org.shortCode = shortCode;
    org.pledgeLinkGeneratedAt = new Date();

    await org.save();

    res.json(org);
  } catch (err) {
    next(err);
  }
};


// LIST (admin)
export const listOrgs = async (req, res, next) => {
  try {
    const {
      search,
      type,
      isActive = "true",
      limit = 20,
      skip = 0,
    } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (isActive !== "all") filter.isActive = isActive === "true";

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { slug: new RegExp(search, "i") },
        { shortCode: new RegExp(search, "i") },
      ];
    }

    const [items, total] = await Promise.all([
      Org.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Org.countDocuments(filter),
    ]);

    res.json({ items, total });
  } catch (err) {
    next(err);
  }
};

// GET by id (admin)
export const getOrg = async (req, res, next) => {
  try {
    const org = await Org.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Org not found" });
    res.json(org);
  } catch (err) {
    next(err);
  }
};

// UPDATE (admin)
export const updateOrg = async (req, res, next) => {
  try {
    const org = await Org.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!org) return res.status(404).json({ message: "Org not found" });
    res.json(org);
  } catch (err) {
    next(err);
  }
};

// SOFT DELETE / deactivate
export const deactivateOrg = async (req, res, next) => {
  try {
    const org = await Org.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!org) return res.status(404).json({ message: "Org not found" });
    res.json(org);
  } catch (err) {
    next(err);
  }
};

// PUBLIC lookup by shortCode (for pledge links)
export const getOrgByCodePublic = async (req, res, next) => {
  try {
    const { code } = req.params;
    const org = await Org.findOne({ shortCode: code, isActive: true }).select(
      "name slug shortCode type logoUrl tagline city state"
    );
    if (!org) return res.status(404).json({ message: "Org not found" });
    res.json(org);
  } catch (err) {
    next(err);
  }
};
