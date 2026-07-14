import type { Employee } from "@/types/employee";
import { getSupabaseClient } from "@/lib/supabase";

export interface EmployeeRepository {
    list(): Promise<Employee[]>;
    get(id: string): Promise<Employee | undefined>;
    create(input: Employee): Promise<Employee>;
    update(id: string, input: Partial<Employee>): Promise<Employee | undefined>;
    delete(id: string): Promise<boolean>;
}

export class SupabaseEmployeeRepository implements EmployeeRepository {
    async list() {
        const client = getSupabaseClient();
        if (!client) {
            return [];
        }

        const { data, error } = await client.from("employees").select("*");
        if (error || !data) {
            return [];
        }

        return data as Employee[];
    }

    async get(id: string) {
        const client = getSupabaseClient();
        if (!client) {
            return undefined;
        }

        const { data, error } = await client.from("employees").select("*").eq("id", id).maybeSingle();
        if (error || !data) {
            return undefined;
        }

        return data as Employee;
    }

    async create(input: Employee) {
        const client = getSupabaseClient();
        if (!client) {
            return input;
        }

        const { data, error } = await client.from("employees").insert(input).select().single();
        if (error || !data) {
            return input;
        }

        return data as Employee;
    }

    async update(id: string, input: Partial<Employee>) {
        const client = getSupabaseClient();
        if (!client) {
            return undefined;
        }

        const { data, error } = await client.from("employees").update(input).eq("id", id).select().single();
        if (error || !data) {
            return undefined;
        }

        return data as Employee;
    }

    async delete(id: string) {
        const client = getSupabaseClient();
        if (!client) {
            return false;
        }

        const { error } = await client.from("employees").delete().eq("id", id);
        return !error;
    }
}
