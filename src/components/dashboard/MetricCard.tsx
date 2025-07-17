import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeType: "positive" | "negative" | "neutral";
  timeframe: string;
  comments?: number;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  timeframe,
  comments = 0,
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-chart-2" />;
      case "negative":
        return <TrendingDown className="h-4 w-4 text-chart-3" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-chart-2";
      case "negative":
        return "text-chart-3";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className={cn("relative overflow-hidden shadow-card hover:shadow-chart transition-all duration-200", className)}>
      <div className="absolute inset-0 bg-gradient-card opacity-50"></div>
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {comments > 0 && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <MessageSquare className="h-3 w-3" />
            {comments}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center space-x-1 text-xs">
          {getTrendIcon()}
          <span className={cn("font-medium", getChangeColor())}>
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground">from {timeframe}</span>
        </div>
      </CardContent>
    </Card>
  );
}