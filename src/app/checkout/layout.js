import { redirect } from "next/navigation";
import { getUser } from "../../lib/auth";

export default async function CheckoutLayout({ children }) {
  if (!await getUser()) redirect("/login?next=%2Fcheckout");
  return children;
}
