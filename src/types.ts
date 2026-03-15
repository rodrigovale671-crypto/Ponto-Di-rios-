export interface Employee {
  id: string;
  name: string;
  role: string;
  dailyRate?: number;
  pixKey?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  ownerId: string;
  createdAt: any;
}

export interface UserConfig {
  pin?: string;
  ownerId: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  type: 'D' | 'M' | 'F'; // D: Diária, M: Meia, F: Falta
  monthYear: string; // YYYY-MM
  ownerId: string;
}
