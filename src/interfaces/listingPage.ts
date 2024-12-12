import { IUser } from "../models/userModel";

export interface QueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface PaginatedResponse {
    data: IUser[];
    total: number;
    page: number;
    totalPages: number;
  }
  