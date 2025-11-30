// UCC Generator: PV <PAN_PREFIX> <3-digit increment>

const generateUCC = async (pan, db) => {
  try {
    // 1. Extract first 2 letters of PAN (uppercase)
    const prefix = pan.substring(0, 2).toUpperCase();

    // 2. Find or create counter for this prefix
    const prefixRecord = await db.collection("uccCounters").findOneAndUpdate(
      { prefix: prefix },
      { $inc: { lastNumber: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    // 3. Get the incremented number
    const number = prefixRecord.lastNumber;

    // 4. Format number as 3-digit (001, 002, 045, 300…)
    const numberFormatted = number.toString().padStart(3, "0");

    // 5. Build final UCC
    const ucc = `PV ${prefix} ${numberFormatted}`;

    return ucc;

  } catch (err) {
    console.error("Error generating UCC:", err);
    throw err;
  }
};




// Create a small collection to store the last number used for each PAN prefix:
// {
//   prefix: "AB",
//   lastNumber: 24
// }
