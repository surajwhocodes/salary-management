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
