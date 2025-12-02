const analyticsService = require('../services/analyticsService');

// StatsController - Version 1.0.6 - Updated domain to viridial.com
class StatsController {

  // registrations stats
  static async getDailyStats(req, res, next) {
    try {
      // Track analytics event
      const data = await analyticsService.getDailyStats(
        req.body.date,
        req.body.eventTypes
      );

      res.json({
        success: true,
        data
      });

    } catch (error) {
      next(error);
    }
  }

  // generateDailyReport stats
  static async generateDailyReport(req, res, next) {
    try {
      // Track analytics event
      const data = await analyticsService.generateDailyReport(
        req.body.date,
        req.body.eventType
      );

      res.json({
        success: true,
        data
      });

    } catch (error) {
      next(error);
    }
  }

  // Obtenir les statistiques sur une période
  static async getStatsRange(req, res, next) {
    try {
      // Track analytics event
      const data = await analyticsService.getStatsRange(
        req.body.startDate,
        req.body.endDate,
        req.body.eventType
      );

      res.json({
        success: true,
        data
      });

    } catch (error) {
      next(error);
    }
  }
}
module.exports = StatsController;