import { pathToFileURL } from "node:url";
export async function ensureAcademicWorkspace(entities) {
  const rows = await entities.Department.filter(
    { slug: "vie-academique" },
    null,
    100000,
  );
  if (rows.length) return { created: false, id: rows[0].id };
  const department = await entities.Department.create({
    slug: "vie-academique",
    name: "Vie Académique",
    description:
      "Organisation des actions et des accompagnements du département. Mission à préciser avec son responsable.",
    icon: "GraduationCap",
    status: "active",
    is_active: true,
  });
  return { created: true, id: department.id };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const { entities, db } = await import("./store.mjs");
  try {
    console.log(JSON.stringify(await ensureAcademicWorkspace(entities)));
  } finally {
    db.close();
  }
}
