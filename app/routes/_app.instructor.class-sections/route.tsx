import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";
import { ClassSectionsPage } from "~/components/instructormodule/ClassSectionsPage";

export const meta: MetaFunction = () => [
  { title: "Class Sections | CodeON" },
  {
    name: "description",
    content: "Manage class sections and student rosters.",
  },
];

export async function loader() {
  return json({});
}

export default function ClassSectionsRoute() {
  return (
    <div className="h-full w-full overflow-y-auto">
      <ClassSectionsPage />
    </div>
  );
}
