import type { Employee } from "@/types/employee";

export interface EmployeeRepository {
  list(): Employee[];
  get(id: string): Employee | undefined;
  create(input: Employee): Employee;
  update(id: string, input: Partial<Employee>): Employee | undefined;
  delete(id: string): boolean;
}

export class InMemoryEmployeeRepository implements EmployeeRepository {
  private readonly store: Employee[];

  constructor(initial: Employee[] = []) {
    this.store = [...initial];
  }

  list() {
    return [...this.store];
  }

  get(id: string) {
    return this.store.find((employee) => employee.id === id);
  }

  create(input: Employee) {
    this.store.push(input);
    return { ...input };
  }

  update(id: string, input: Partial<Employee>) {
    const index = this.store.findIndex((employee) => employee.id === id);
    if (index < 0) {
      return undefined;
    }

    const updated = { ...this.store[index], ...input };
    this.store[index] = updated;
    return updated;
  }

  delete(id: string) {
    const index = this.store.findIndex((employee) => employee.id === id);
    if (index < 0) {
      return false;
    }

    this.store.splice(index, 1);
    return true;
  }
}
