// Department is the historic storage name for a ministry; preserve IDs and links.
// Older migrations only wrote is_active. An explicit inactive status always wins.
export const isActiveDepartment = department => Boolean(department) && department.is_active !== false && (!department.status || department.status === 'active');
