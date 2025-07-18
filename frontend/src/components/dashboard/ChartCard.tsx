import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  description?: string; // Make description an optional prop
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {/* Conditionally render the description if it exists */}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 flex pb-4">
        {children}
      </CardContent>
    </Card>
  )
}
