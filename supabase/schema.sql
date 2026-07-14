create table if not exists countries (
  id bigint primary key generated always as identity,
  name text not null unique,
  currency text not null
);

create table if not exists departments (
  id bigint primary key generated always as identity,
  name text not null unique
);

create table if not exists employees (
  id bigint primary key generated always as identity,
  employee_id text not null unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  department_id bigint references departments(id),
  country_id bigint references countries(id),
  currency text not null,
  joining_date date not null,
  employment_type text not null,
  status text not null,
  base_salary numeric not null,
  bonus numeric not null,
  allowance numeric not null,
  tax numeric not null,
  net_salary numeric not null,
  manager text not null,
  last_updated date not null
);

create table if not exists salary_records (
  id bigint primary key generated always as identity,
  employee_id bigint references employees(id) on delete cascade,
  change_reason text not null,
  old_salary numeric not null,
  new_salary numeric not null,
  changed_at date not null
);

create table if not exists salary_components (
  id bigint primary key generated always as identity,
  employee_id bigint references employees(id) on delete cascade,
  component_name text not null,
  amount numeric not null,
  effective_date date not null
);

create table if not exists users (
  id bigint primary key generated always as identity,
  email text not null unique,
  role text not null,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id bigint primary key generated always as identity,
  actor_id bigint references users(id),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_employees_department_id on employees(department_id);
create index if not exists idx_employees_country_id on employees(country_id);
create index if not exists idx_salary_records_employee_id on salary_records(employee_id);
create index if not exists idx_salary_components_employee_id on salary_components(employee_id);
create index if not exists idx_employees_status on employees(status);
create index if not exists idx_employees_last_updated on employees(last_updated desc);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id, created_at desc);

alter table countries enable row level security;
alter table departments enable row level security;
alter table employees enable row level security;
alter table salary_records enable row level security;
alter table salary_components enable row level security;
alter table users enable row level security;
alter table audit_logs enable row level security;

create policy "authenticated users can read HR data" on countries for select to authenticated using (true);
create policy "authenticated users can read departments" on departments for select to authenticated using (true);
create policy "authenticated users can read employees" on employees for select to authenticated using (true);
create policy "authenticated users can read salary records" on salary_records for select to authenticated using (true);
create policy "authenticated users can read salary components" on salary_components for select to authenticated using (true);

create policy "HR managers can manage reference data" on countries for all to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'HR Manager') in ('Admin', 'HR Manager'))
with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'HR Manager') in ('Admin', 'HR Manager'));
create policy "HR managers can manage departments" on departments for all to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'HR Manager') in ('Admin', 'HR Manager'))
with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'HR Manager') in ('Admin', 'HR Manager'));

create policy "HR managers can manage employees" on employees for all to authenticated
using (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'HR Manager') in ('Admin', 'HR Manager'))
with check (coalesce(auth.jwt() -> 'user_metadata' ->> 'role', 'HR Manager') in ('Admin', 'HR Manager'));
