import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
export function useDashboardStats() {
    // @ts-expect-error - Admin API types are dynamically generated
    return useQuery(api.admin.getDashboardStats);
}

export function useUsers(role: "student" | "parent" | "vendor") {
    // @ts-expect-error - Admin API types are dynamically generated
    return useQuery(api.admin.getUsers, { role });
}

export function useSchools() {
    // @ts-expect-error - Admin API types are dynamically generated
    return useQuery(api.admin.getSchools);
}

export function useStudentsList() {
    // @ts-expect-error - Admin API types are dynamically generated
    return useQuery(api.admin.getStudentsList);
}

export function useParentsList() {
    // @ts-expect-error - Admin API types are dynamically generated
    return useQuery(api.admin.getParentsList);
}

export function useCreateStudent() {
    // @ts-expect-error - Admin API types are dynamically generated
    return useMutation(api.admin.createStudent);
}

export function useCreateParent() {
    // @ts-expect-error - Admin API types are dynamically generated
    return useMutation(api.admin.createParent);
}

export function useCreateVendor() {
    // @ts-expect-error - Admin API types are dynamically generated
    return useMutation(api.admin.createVendor);
}

export function useLinkParentStudent() {
    // @ts-expect-error - Admin API types are dynamically generated
    return useMutation(api.admin.linkParentStudent);
}
