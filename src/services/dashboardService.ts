import { IdashboardService } from './interfaces/IdashboardService';
import { IdashboardRepository } from '../repositories/interfaces/IdashboardRepository';
import { DashboardMetrics, JobMetrics, NetworkMetrics, UserGrowthMetrics } from '../interfaces/dashboard';
import { CustomError } from '../errors/customErrors';
import { HttpStatusCodes } from '../config/HttpStatusCodes';

export class dashboardService implements IdashboardService {
  private metricsRepository: IdashboardRepository;

  constructor(metricsRepository: IdashboardRepository) {
    this.metricsRepository = metricsRepository;
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const metrics = await this.metricsRepository.fetchMetrics();
      
      if (!metrics) {
        throw new CustomError(
          'Failed to fetch dashboard metrics',
          HttpStatusCodes.NOT_FOUND
        );
      }

      return metrics;
    } catch (error: any) {
      console.error('Error in MetricsService:', error.message);
      throw new CustomError(
        error.message || 'Failed to fetch dashboard metrics',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getJobMetrics(): Promise<JobMetrics> {
    try {
      const metrics = await this.metricsRepository.fetchJobMetrics();
      if (!metrics) {
        throw new CustomError('Failed to fetch job metrics', HttpStatusCodes.NOT_FOUND);
      }
      return metrics;
    } catch (error: any) {
      throw new CustomError(
        error.message || 'Failed to fetch job metrics',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getNetworkMetrics(): Promise<NetworkMetrics> {
    try {
      const metrics = await this.metricsRepository.fetchNetworkMetrics();
      
      if (!metrics) {
        throw new CustomError(
          'Failed to fetch network metrics',
          HttpStatusCodes.NOT_FOUND
        );
      }

      return metrics;
    } catch (error: any) {
      console.error('Error in NetworkService:', error.message);
      throw new CustomError(
        error.message || 'Failed to fetch network metrics',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getUserGrowthMetrics(): Promise<UserGrowthMetrics> {
    try {
      const metrics = await this.metricsRepository.fetchUserGrowthMetrics();
      if (!metrics) {
        throw new CustomError('Failed to fetch user growth metrics', HttpStatusCodes.NOT_FOUND);
      }
      return metrics;
    } catch (error: any) {
      throw new CustomError(
        error.message || 'Failed to fetch user growth metrics',
        error.status || HttpStatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  }
}   