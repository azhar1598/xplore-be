import { Request, Response } from "express";
import { BusinessService } from "../services/business.service";

export class BusinessController {
  private businessService: BusinessService;

  constructor() {
    this.businessService = new BusinessService();
  }

  async getBusinessInsights(req: Request, res: Response) {
    try {
      const businessName = req.query.name as string;

      if (!businessName) {
        return res.status(400).json({ error: "Business name is required" });
      }

      const insights = await this.businessService.getBusinessInsights(
        businessName
      );
      return res.json(insights);
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
