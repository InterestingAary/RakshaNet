import { redirect } from "next/navigation";

/**
 * Root page: redirects to citizen portal by default.
 * Authority dashboard is accessible via /authority route.
 */
export default function RootPage() {
  redirect("/citizen");
}
