// src/types/api.ts
export interface User {
  id: number
  userId: number
  orgId: number
  orgSlug: string
  orgName: string
  name: string
  firstName: string
  lastName: string
  email: string
  role: 'OrgAdmin' | 'Admin' | 'Staff'
  departmentId?: number
  departmentName?: string
}

export interface Organization {
  id: number
  orgId: number
  orgSlug: string
  orgName: string
  adminEmail: string
}

export interface Department {
  id: number
  orgId: number
  name: string
  userCount: number
}

export interface Checkin {
  id: number
  userId: number
  latitude: number
  longitude: number
  checkInTime: string
  checkOutTime?: string
}
