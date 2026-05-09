import { DocumentCard } from "./DocumentCard";
export function DocumentList() { const docs = [{title:"Bathroom estimate EST-001", type:"Estimate"},{title:"Weekly pharmacy report", type:"Report"},{title:"Dental recall template", type:"Template"}]; return <div className="grid gap-3 md:grid-cols-3">{docs.map(doc => <DocumentCard key={doc.title} {...doc} />)}</div>; }
