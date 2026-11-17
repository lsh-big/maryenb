import { redirect } from "next/navigation";
import { getUser } from "../../lib/auth";

export default async function CartLayout({ children }) {
  if (!await getUser()) redirect("/login?next=%2Fcart");
  return children;
}
