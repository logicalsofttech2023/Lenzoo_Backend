import cron from "node-cron";
import Purchase from "../models/Purchase.js";

export const expireOldPurchases = () => {
  cron.schedule("0 * * * *", async () => {
    // Runs every hour at minute 0
    try {
      const now = new Date();

      const result = await Purchase.updateMany(
        { endDate: { $lt: now }, status: "active" },
        { $set: { status: "expired" } }
      );

      console.log(
        `${result.modifiedCount} memberships expired as of ${now.toISOString()}`
      );
    } catch (error) {
      console.error("Error in expireOldPurchases CRON job:", error);
    }
  });
};
