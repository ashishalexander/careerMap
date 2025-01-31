export interface MetricTrend {
    type: 'increase' | 'decrease';
    value: string;
  }
  
  export interface MetricData {
    value: string;
    trend: MetricTrend;
  }
  
  export interface DashboardMetrics {
    totalUsers: MetricData;
    activeUsers: MetricData;
    revenue: MetricData;
    growthRate: MetricData;
  }

  export interface JobMetrics {
    jobPostingTrends: Array<{
      month: string;
      postings: number;
    }>;
    jobTypeDistribution: Array<{
      name: string;
      value: number;
    }>;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    averageCompletionTime: number;
    jobSuccessRate: number;
  }

  export interface NetworkMetrics {
    connectionActivity: Array<{
      month: string;
      connections: number;
      requestsSent: number;
      requestsReceived: number;
    }>;
    connectionStatus: Array<{
      name: string;
      value: number;
    }>;
  }
  
  export interface MonthlyAggregationResult {
    _id: {
      month: number;
      year: number;
    };
    count: number;
  }
  
export interface NetworkActivityAggregation {
    connections: MonthlyAggregationResult[];
    requestsSent: MonthlyAggregationResult[];
    requestsReceived: MonthlyAggregationResult[];
  }
  
  export interface ConnectionStatusAggregation {
    activeConnections: Array<{ _id: null; total: number }>;
    pendingSent: Array<{ _id: null; total: number }>;
    pendingReceived: Array<{ _id: null; total: number }>;
  }


  export interface UserGrowthMetrics {
    monthlyUserGrowth: MonthlyGrowthData[];
    userDistribution: UserDistributionData[];
  }
  
  // Interface for monthly growth data points
  export interface MonthlyGrowthData {
    month: string;           // Format: "YYYY-MM"
    totalUsers: number;      // Total number of users for the month
    recruiters: number;      // Number of recruiter users
    regularUsers: number;    // Number of regular users
  }
  
  // Interface for user distribution data
  export interface UserDistributionData {
    type: string;           // "Recruiters" or "Regular Users"
    count: number;          // Count of users in this category
  }
  
  // Interface for API response
  export interface UserGrowthMetricsResponse {
    message: string;
    data: UserGrowthMetrics;
  }
  
  // Optional: Additional interfaces for request parameters if needed
  export interface UserGrowthMetricsParams {
    startDate?: string;     // Optional start date for filtering
    endDate?: string;       // Optional end date for filtering
    interval?: 'day' | 'week' | 'month' | 'year';  // Optional grouping interval
  }
  
  // Interface for error responses
  export interface MetricsError {
    message: string;
    status: number;
    details?: string;
  }
  
  export interface UserAggregation {
    type: boolean;  // isRecruiter value
    count: number;
  }
  
  export interface MonthlyGrowthAggregation {
    month: string;
    users: {
      role: string;
      count: number;
    }[];
  }
  