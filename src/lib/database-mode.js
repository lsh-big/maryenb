export function isVirtualDatabase() {
  return process.env.DB_MODE !== "real";
}
