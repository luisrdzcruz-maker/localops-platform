"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import type {
  ReportDefinition,
  ReportFormat,
} from "@/types/reports";

interface Props {
  /** Plain JSON-safe metadata extracted from a ReportDefinition. */
  definition: {
    id: ReportDefinition["id"];
    title: string;
    description: string;
    formats: ReportFormat[];
  };
  defaultPeriodStart: string;
  defaultPeriodEnd: string;
}

const FORMAT_LABEL: Record<ReportFormat, string> = {
  pdf: "PDF",
  xlsx: "Excel",
  csv: "CSV",
};

const FORMAT_ICON: Record<ReportFormat, React.ReactNode> = {
  pdf: <FileText className="h-3.5 w-3.5" />,
  xlsx: <FileSpreadsheet className="h-3.5 w-3.5" />,
  csv: <FileSpreadsheet className="h-3.5 w-3.5" />,
};

export function ReportCard({
  definition,
  defaultPeriodStart,
  defaultPeriodEnd,
}: Props) {
  const [start, setStart] = useState(defaultPeriodStart);
  const [end, setEnd] = useState(defaultPeriodEnd);

  function downloadHref(format: ReportFormat) {
    const params = new URLSearchParams({
      format,
      periodStart: start,
      periodEnd: end,
    });
    return `/api/reports/${definition.id}?${params.toString()}`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{definition.title}</CardTitle>
        <CardDescription>{definition.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${definition.id}-start`}>Desde</Label>
          <Input
            id={`${definition.id}-start`}
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${definition.id}-end`}>Hasta</Label>
          <Input
            id={`${definition.id}-end`}
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {definition.formats.map((f) => (
          <a key={f} href={downloadHref(f)} download>
            <Button size="sm" variant={f === "pdf" ? "primary" : "secondary"}>
              <Download className="h-3.5 w-3.5" />
              {FORMAT_ICON[f]}
              {FORMAT_LABEL[f]}
            </Button>
          </a>
        ))}
      </CardFooter>
    </Card>
  );
}
