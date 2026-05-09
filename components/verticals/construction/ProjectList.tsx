import type { ConstructionProject } from "@/types/construction";
import { Table } from "@/components/ui/Table";
export function ProjectList({ projects }: { projects: ConstructionProject[] }) { return <Table headers={["Project", "Status", "Budget"]} rows={projects.map(p => [p.name, p.status, p.budget ? `€${p.budget}` : "-"])} />; }
