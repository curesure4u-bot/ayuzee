import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HrmsEmployee {
  id: string;
  employeeCode: string;
  name: string;
  role: string;
  department: string;
  departmentId: string | null;
  designation: string | null;
  designationId: string | null;
  branchId: string | null;
  branchName: string | null;
  phone: string;
  email: string;
  gender: string | null;
  dateOfBirth: string | null;
  joinDate: string;
  employmentType: string;
  employeeStatus: string;
  salary: number;
  photoUrl: string | null;
  reportingManagerId: string | null;
  reportingManagerName: string | null;
  shiftId: string | null;
  weeklyOff: string;
  todayAttendance: string;
  city: string | null;
  state: string | null;
}

export interface EmployeeFilters {
  search: string;
  department: string;
  status: string;
  employmentType: string;
  branch: string;
}

export interface CreateEmployeeInput {
  name: string;
  role: string;
  department: string;
  departmentId?: string;
  designationId?: string;
  branchId?: string;
  phone?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  joinDate: string;
  employmentType: string;
  salary?: number;
  shiftId?: string;
  weeklyOff?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_EMPLOYEES: HrmsEmployee[] = [
  { id: "1", employeeCode: "EMP-0001", name: "Dr. Arun Sharma", role: "Senior Doctor", department: "Ayurveda", departmentId: null, designation: "Senior Consultant", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543210", email: "arun@ayuzee.com", gender: "male", dateOfBirth: "1985-03-15", joinDate: "2023-04-01", employmentType: "permanent", employeeStatus: "active", salary: 120000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "present", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "2", employeeCode: "EMP-0002", name: "Dr. Meena Patel", role: "Doctor", department: "Panchakarma", departmentId: null, designation: "Consultant", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543211", email: "meena@ayuzee.com", gender: "female", dateOfBirth: "1990-07-22", joinDate: "2024-01-15", employmentType: "permanent", employeeStatus: "active", salary: 85000, photoUrl: null, reportingManagerId: "1", reportingManagerName: "Dr. Arun Sharma", shiftId: null, weeklyOff: "Sunday", todayAttendance: "present", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "3", employeeCode: "EMP-0003", name: "Rajesh K", role: "Receptionist", department: "Front Office", departmentId: null, designation: "Senior Receptionist", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543212", email: "", gender: "male", dateOfBirth: "1995-11-08", joinDate: "2024-06-01", employmentType: "permanent", employeeStatus: "active", salary: 25000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "present", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "4", employeeCode: "EMP-0004", name: "Sunita M", role: "Nurse", department: "IPD", departmentId: null, designation: "Staff Nurse", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543213", email: "", gender: "female", dateOfBirth: "1992-05-30", joinDate: "2023-09-01", employmentType: "permanent", employeeStatus: "active", salary: 35000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "absent", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "5", employeeCode: "EMP-0005", name: "Vikram R", role: "Pharmacist", department: "Pharmacy", departmentId: null, designation: "Pharmacist", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543214", email: "", gender: "male", dateOfBirth: "1988-09-12", joinDate: "2024-03-01", employmentType: "permanent", employeeStatus: "active", salary: 40000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "present", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "6", employeeCode: "EMP-0006", name: "Anita D", role: "Lab Technician", department: "Laboratory", departmentId: null, designation: "Lab Technician", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543215", email: "", gender: "female", dateOfBirth: "1994-02-18", joinDate: "2024-08-01", employmentType: "probation", employeeStatus: "probation", salary: 30000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "present", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "7", employeeCode: "EMP-0007", name: "Suresh Therapist", role: "Therapist (Senior)", department: "Panchakarma", departmentId: null, designation: "Senior Therapist", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543216", email: "", gender: "male", dateOfBirth: "1986-12-05", joinDate: "2022-01-10", employmentType: "permanent", employeeStatus: "active", salary: 35000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "present", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "8", employeeCode: "EMP-0008", name: "Priya Therapist", role: "Therapist", department: "Panchakarma", departmentId: null, designation: "Therapist", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543218", email: "", gender: "female", dateOfBirth: "1996-08-25", joinDate: "2023-07-01", employmentType: "permanent", employeeStatus: "active", salary: 28000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "present", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "9", employeeCode: "EMP-0009", name: "Mohan P", role: "Therapist", department: "Panchakarma", departmentId: null, designation: "Therapist", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543219", email: "", gender: "male", dateOfBirth: "1998-04-14", joinDate: "2024-02-01", employmentType: "probation", employeeStatus: "probation", salary: 28000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "leave", city: "Kadayanallur", state: "Tamil Nadu" },
  { id: "10", employeeCode: "EMP-0010", name: "Kavita S", role: "Admin Manager", department: "Administration", departmentId: null, designation: "Admin Manager", designationId: null, branchId: null, branchName: "Main Hospital", phone: "9876543217", email: "kavita@ayuzee.com", gender: "female", dateOfBirth: "1987-06-20", joinDate: "2022-06-15", employmentType: "permanent", employeeStatus: "active", salary: 55000, photoUrl: null, reportingManagerId: null, reportingManagerName: null, shiftId: null, weeklyOff: "Sunday", todayAttendance: "present", city: "Kadayanallur", state: "Tamil Nadu" },
];

// ─── Main Hook ───────────────────────────────────────────────────────────────

export const useHrmsEmployees = (filters: EmployeeFilters) => {
  const [employees, setEmployees] = useState<HrmsEmployee[]>(MOCK_EMPLOYEES);
  const [totalCount, setTotalCount] = useState(MOCK_EMPLOYEES.length);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = (supabase as any)
        .from("hms_staff")
        .select("*")
        .eq("is_active", true)
        .order("name");

      // Apply filters at DB level where possible
      if (filters.department && filters.department !== "all") {
        query = query.eq("department", filters.department);
      }
      if (filters.status && filters.status !== "all") {
        if (filters.status === "probation") {
          query = query.or("employee_status.eq.probation,employment_type.eq.probation");
        } else {
          query = query.eq("employee_status", filters.status);
        }
      }
      if (filters.employmentType && filters.employmentType !== "all") {
        query = query.eq("employment_type", filters.employmentType);
      }

      const { data: rows, error: fetchErr } = await query;

      if (fetchErr) {
        console.warn("HRMS Employees fetch error:", fetchErr.message);
        setError(fetchErr.message);
        // Apply client-side filters to mock data
        applyFiltersToMock();
        setLoading(false);
        return;
      }

      if (!rows || rows.length === 0) {
        applyFiltersToMock();
        setLoading(false);
        return;
      }

      // Map DB rows to interface
      let mapped: HrmsEmployee[] = rows.map((r: any) => ({
        id: r.id,
        employeeCode: r.employee_code || `EMP-${r.id.slice(0, 4)}`,
        name: r.name,
        role: r.role,
        department: r.department || "Unassigned",
        departmentId: r.department_id,
        designation: r.designation || r.role,
        designationId: r.designation_id,
        branchId: r.branch_id,
        branchName: null,
        phone: r.phone || "",
        email: r.email || "",
        gender: r.gender,
        dateOfBirth: r.date_of_birth,
        joinDate: r.join_date || "",
        employmentType: r.employment_type || "permanent",
        employeeStatus: r.employee_status || r.status || "active",
        salary: Number(r.salary) || 0,
        photoUrl: r.photo_url,
        reportingManagerId: r.reporting_manager_id,
        reportingManagerName: null,
        shiftId: r.shift_id,
        weeklyOff: r.weekly_off || "Sunday",
        todayAttendance: r.today_attendance || "present",
        city: r.city,
        state: r.state,
      }));

      // Client-side search filter
      if (filters.search) {
        const s = filters.search.toLowerCase();
        mapped = mapped.filter(
          (e) =>
            e.name.toLowerCase().includes(s) ||
            e.employeeCode.toLowerCase().includes(s) ||
            e.role.toLowerCase().includes(s) ||
            e.department.toLowerCase().includes(s) ||
            e.phone.includes(s)
        );
      }

      // Extract unique departments
      const depts = [...new Set(rows.map((r: any) => r.department).filter(Boolean))].sort() as string[];
      setDepartments(depts);
      setEmployees(mapped);
      setTotalCount(mapped.length);
      setLoading(false);
    } catch (err: any) {
      console.error("HRMS Employees error:", err);
      setError(err.message || "Unknown error");
      applyFiltersToMock();
      setLoading(false);
    }
  }, [filters.search, filters.department, filters.status, filters.employmentType, filters.branch]);

  const applyFiltersToMock = () => {
    let filtered = [...MOCK_EMPLOYEES];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(s) ||
          e.employeeCode.toLowerCase().includes(s) ||
          e.role.toLowerCase().includes(s) ||
          e.department.toLowerCase().includes(s)
      );
    }
    if (filters.department && filters.department !== "all") {
      filtered = filtered.filter((e) => e.department === filters.department);
    }
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((e) => e.employeeStatus === filters.status);
    }
    if (filters.employmentType && filters.employmentType !== "all") {
      filtered = filtered.filter((e) => e.employmentType === filters.employmentType);
    }
    setEmployees(filtered);
    setTotalCount(filtered.length);
    setDepartments([...new Set(MOCK_EMPLOYEES.map((e) => e.department))].sort());
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ─── Add Employee ────────────────────────────────────────────────────────

  const addEmployee = async (input: CreateEmployeeInput): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from("hms_staff")
        .insert({
          name: input.name,
          role: input.role,
          department: input.department,
          department_id: input.departmentId || null,
          designation_id: input.designationId || null,
          branch_id: input.branchId || null,
          phone: input.phone || null,
          email: input.email || null,
          gender: input.gender || null,
          date_of_birth: input.dateOfBirth || null,
          join_date: input.joinDate,
          employment_type: input.employmentType,
          salary: input.salary || 0,
          shift_id: input.shiftId || null,
          weekly_off: input.weeklyOff || "Sunday",
          employee_status: input.employmentType === "probation" ? "probation" : "active",
          today_attendance: "present",
          is_active: true,
        });

      if (error) {
        console.error("Add employee error:", error);
        return false;
      }
      await fetchEmployees();
      return true;
    } catch (err) {
      console.error("Add employee exception:", err);
      return false;
    }
  };

  // ─── Update Employee Status ──────────────────────────────────────────────

  const updateEmployeeStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from("hms_staff")
        .update({ employee_status: status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) return false;
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, employeeStatus: status } : e))
      );
      return true;
    } catch {
      return false;
    }
  };

  return {
    employees,
    totalCount,
    departments,
    loading,
    error,
    addEmployee,
    updateEmployeeStatus,
    refetch: fetchEmployees,
  };
};
