export interface Department {
  department_ID: number;
  department_Name: string;
  department_Address?: string;
}

export interface Employee {
  employee_ID: number;
  department_ID: number;
  employee_First_name: string;
  employee_Last_Name: string;
  gender?: string;
  date_of_Birth?: string;
  date_Joined: string;
  employee_Address?: string;
  photo?: string;
  department?: Department;
}