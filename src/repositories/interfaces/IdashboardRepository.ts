import { DashboardMetrics, JobMetrics, NetworkMetrics, UserGrowthMetrics } from "../../interfaces/dashboard";

export interface IdashboardRepository{
    fetchMetrics(): Promise<DashboardMetrics> 
    fetchJobMetrics(): Promise<JobMetrics>
    fetchNetworkMetrics(): Promise<NetworkMetrics>
    fetchUserGrowthMetrics(): Promise<UserGrowthMetrics>
}