'use client';

import { useState, useEffect } from 'react';
import { Employee, Department } from '@/app/types';

const SERVER_BASE = 'http://localhost:5057';
const API_BASE = `${SERVER_BASE}/api`;

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [selectedDeptId, setSelectedDeptId] = useState<number | string>('');

    // State to manage edit modal
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${API_BASE}/employees`, { cache: 'no-store' });
            if (res.ok) setEmployees(await res.json());
        } catch (err) {
            console.error('Failed to load employees', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetch(`${API_BASE}/departments`)
            .then((res) => res.json())
            .then((data: Department[]) => {
                setDepartments(data);
                if (data.length > 0) setSelectedDeptId(data[0].department_ID);
            })
            .catch((err) => console.error('Failed to load departments', err));
    }, []);

    // Insert Employee (POST)
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`${API_BASE}/employees`, {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                form.reset();
                setPhotoPreview(null);
                if (departments.length > 0) setSelectedDeptId(departments[0].department_ID);
                await fetchEmployees();
            } else {
                const errorText = await res.text();
                console.error('Server error:', errorText);
            }
        } catch (err) {
            console.error('Network error creating employee', err);
        }
    };

    // Update Employee (PUT)
    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingEmployee) return;

        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const res = await fetch(`${API_BASE}/employees/${editingEmployee.employee_ID}`, {
                method: 'PUT',
                body: formData,
            });

            if (res.ok) {
                setEditingEmployee(null);
                setEditPhotoPreview(null);
                await fetchEmployees();
            } else {
                const errorText = await res.text();
                console.error('Failed to update employee:', errorText);
            }
        } catch (err) {
            console.error('Network error updating employee', err);
        }
    };

    // Delete Employee (DELETE)
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            const res = await fetch(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
            if (res.ok) await fetchEmployees();
        } catch (err) {
            console.error('Failed to delete employee', err);
        }
    };

    // Helper to format ISO strings to YYYY-MM-DD for date inputs
    const formatDateForInput = (dateString?: string) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 font-sans">
            <h1 className="text-2xl font-bold">Employee Management</h1>

            {/* Insert Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-gray-50">
                <h2 className="col-span-2 text-lg font-semibold">Add New Employee</h2>
                <input name="Employee_First_name" placeholder="First Name" required className="p-2 border rounded" />
                <input name="Employee_Last_Name" placeholder="Last Name" required className="p-2 border rounded" />

                <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select name="Gender" className="w-full p-2 border rounded">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <select
                        name="Department_ID"
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                        className="w-full p-2 border rounded"
                    >
                        {departments.map((dept) => (
                            <option key={dept.department_ID} value={dept.department_ID}>
                                {dept.department_Name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                    <input type="date" name="Date_of_Birth" className="w-full p-2 border rounded" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Date Joined</label>
                    <input type="date" name="Date_Joined" required className="w-full p-2 border rounded" />
                </div>

                <input name="Employee_Address" placeholder="Address" className="p-2 border rounded col-span-2" />

                <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Photo</label>
                    <input
                        type="file"
                        name="PhotoFile"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = () => setPhotoPreview(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                </div>

                {photoPreview && (
                    <div className="col-span-2 flex justify-center">
                        <img src={photoPreview} alt="Preview" className="max-w-xs max-h-36 rounded border object-contain" />
                    </div>
                )}

                <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                    Add Employee
                </button>
            </form>

            {/* Employees Table */}
            <table className="w-full border border-collapse">
                <thead>
                    <tr className="bg-gray-100 border-b text-left">
                        <th className="p-2">Photo</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Department</th>
                        <th className="p-2">Joined</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.employee_ID} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                                {emp.photo ? (
                                    <img
                                        src={`${SERVER_BASE}${emp.photo}`}
                                        alt=""
                                        className="w-10 h-10 object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                            <td className="p-2">{emp.employee_First_name} {emp.employee_Last_Name}</td>
                            <td className="p-2">{emp.department?.department_Name ?? emp.department_ID}</td>
                            <td className="p-2">{new Date(emp.date_Joined).toLocaleDateString()}</td>
                            <td className="p-2 space-x-3">
                                <button
                                    onClick={() => {
                                        setEditingEmployee(emp);
                                        setEditPhotoPreview(emp.photo ? `${SERVER_BASE}${emp.photo}` : null);
                                    }}
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(emp.employee_ID)}
                                    className="text-red-600 hover:underline font-medium"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            {editingEmployee && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Employee</h2>
                            <button
                                type="button"
                                onClick={() => setEditingEmployee(null)}
                                className="text-gray-500 hover:text-gray-800 text-lg font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
                            <input
                                name="Employee_First_name"
                                defaultValue={editingEmployee.employee_First_name}
                                required
                                className="p-2 border rounded"
                                placeholder="First Name"
                            />
                            <input
                                name="Employee_Last_Name"
                                defaultValue={editingEmployee.employee_Last_Name}
                                required
                                className="p-2 border rounded"
                                placeholder="Last Name"
                            />

                            <div>
                                <label className="block text-sm font-medium mb-1">Gender</label>
                                <select
                                    name="Gender"
                                    defaultValue={editingEmployee.gender ?? 'Male'}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Department</label>
                                <select
                                    name="Department_ID"
                                    defaultValue={editingEmployee.department_ID}
                                    className="w-full p-2 border rounded"
                                >
                                    {departments.map((dept) => (
                                        <option key={dept.department_ID} value={dept.department_ID}>
                                            {dept.department_Name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="Date_of_Birth"
                                    defaultValue={formatDateForInput(editingEmployee.date_of_Birth)}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Date Joined</label>
                                <input
                                    type="date"
                                    name="Date_Joined"
                                    defaultValue={formatDateForInput(editingEmployee.date_Joined)}
                                    required
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <input
                                name="Employee_Address"
                                defaultValue={editingEmployee.employee_Address ?? ''}
                                placeholder="Address"
                                className="p-2 border rounded col-span-2"
                            />

                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Change Photo (optional)</label>
                                <input
                                    type="file"
                                    name="PhotoFile"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = () => setEditPhotoPreview(reader.result as string);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </div>

                            {editPhotoPreview && (
                                <div className="col-span-2 flex justify-center">
                                    <img src={editPhotoPreview} alt="Preview" className="max-w-xs max-h-32 rounded border object-contain" />
                                </div>
                            )}

                            <div className="col-span-2 flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingEmployee(null)}
                                    className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}