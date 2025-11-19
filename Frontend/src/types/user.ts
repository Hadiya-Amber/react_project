export enum UserRole {
  Customer = 0,
  BranchManager = 1,
  Admin = 2
}

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Suspended = 3
}

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: UserStatus;
  address?: string;
  dateOfBirth: string;
  gender: Gender;
  branchId?: number;
  employeeCode?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  branchName?: string;
  branchCode?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SimpleCustomerRegistrationDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  address?: string;
  dateOfBirth: string;
  gender: Gender;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
