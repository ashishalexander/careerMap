import { DashboardMetrics, JobMetrics, NetworkMetrics, UserGrowthMetrics } from "../../interfaces/dashboard";

export interface IdashboardService{
    getDashboardMetrics(): Promise<DashboardMetrics>
    getJobMetrics(): Promise<JobMetrics>
    getNetworkMetrics(): Promise<NetworkMetrics>
    getUserGrowthMetrics(): Promise<UserGrowthMetrics>
}