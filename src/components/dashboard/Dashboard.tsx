import { useState, useEffect } from "react";
import { DashboardLayout } from "./DashboardLayout";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { AnalyticsChart } from "./AnalyticsChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Clock, Users, Target, AlertTriangle } from "lucide-react";

// Sample data for charts
const revenueData = [
  { name: "Jan", value: 4000, comparison: 3500 },
  { name: "Feb", value: 3000, comparison: 2800 },
  { name: "Mar", value: 5000, comparison: 4200 },
  { name: "Apr", value: 4500, comparison: 3900 },
  { name: "May", value: 6000, comparison: 5100 },
  { name: "Jun", value: 5500, comparison: 4800 },
  { name: "Jul", value: 7000, comparison: 6200 },
];

const conversionData = [
  { name: "Week 1", value: 12.5 },
  { name: "Week 2", value: 14.2 },
  { name: "Week 3", value: 13.8 },
  { name: "Week 4", value: 15.6 },
  { name: "Week 5", value: 16.1 },
  { name: "Week 6", value: 14.9 },
];

const trafficData = [
  { name: "Mon", value: 890 },
  { name: "Tue", value: 1200 },
  { name: "Wed", value: 950 },
  { name: "Thu", value: 1400 },
  { name: "Fri", value: 1650 },
  { name: "Sat", value: 800 },
  { name: "Sun", value: 600 },
];

const sampleComments = [
  {
    id: "1",
    user: "Sarah Chen",
    avatar: "/avatars/sarah.jpg",
    message: "Interesting spike in July - likely due to summer campaign.",
    timestamp: "2 hours ago",
    color: "user-1"
  },
  {
    id: "2",
    user: "Mike Rodriguez",
    avatar: "/avatars/mike.jpg",
    message: "We should investigate the May dip further.",
    timestamp: "4 hours ago",
    color: "user-2"
  }
];

const anomalies = [
  {
    id: 1,
    title: "Unusual Traffic Spike",
    description: "200% increase in organic traffic detected",
    severity: "high",
    timestamp: "15 minutes ago"
  },
  {
    id: 2,
    title: "Conversion Rate Drop",
    description: "5% decrease in mobile conversions",
    severity: "medium",
    timestamp: "1 hour ago"
  }
];

export function Dashboard() {
  const [isRealTime, setIsRealTime] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant={isRealTime ? "default" : "secondary"} className="gap-2">
              <div className={`h-2 w-2 rounded-full ${isRealTime ? 'bg-chart-2 animate-pulse' : 'bg-muted-foreground'}`}></div>
              {isRealTime ? "Live" : "Paused"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          
          <Button
            variant={isRealTime ? "secondary" : "default"}
            onClick={() => setIsRealTime(!isRealTime)}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            {isRealTime ? "Pause" : "Resume"} Live Updates
          </Button>
        </div>

        {/* AI Anomaly Detection */}
        {anomalies.length > 0 && (
          <Card className="border-chart-3/20 bg-chart-3/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-chart-3">
                <AlertTriangle className="h-5 w-5" />
                AI-Detected Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <div key={anomaly.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div>
                      <h4 className="font-medium text-foreground">{anomaly.title}</h4>
                      <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={anomaly.severity === "high" ? "destructive" : "secondary"}>
                        {anomaly.severity}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{anomaly.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value="$45,231"
            change={12.5}
            changeType="positive"
            timeframe="last month"
            comments={3}
          />
          <MetricCard
            title="Active Users"
            value="2,350"
            change={-2.1}
            changeType="negative"
            timeframe="last week"
            comments={1}
          />
          <MetricCard
            title="Conversion Rate"
            value="15.6%"
            change={4.8}
            changeType="positive"
            timeframe="last week"
            comments={5}
          />
          <MetricCard
            title="Avg Session Duration"
            value="4m 32s"
            change={0.2}
            changeType="neutral"
            timeframe="yesterday"
          />
        </div>

        {/* Main Charts */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="traffic">Traffic Analysis</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ChartCard
                title="Revenue Trend"
                subtitle="Monthly revenue vs last year"
                comments={sampleComments}
                isEditing={false}
              >
                <AnalyticsChart 
                  data={revenueData} 
                  type="area" 
                  color="primary"
                  height={300}
                />
              </ChartCard>

              <ChartCard
                title="Conversion Rates"
                subtitle="Weekly conversion performance"
                comments={[]}
              >
                <AnalyticsChart 
                  data={conversionData} 
                  type="line" 
                  color="secondary"
                  height={300}
                />
              </ChartCard>
            </div>

            <ChartCard
              title="Daily Traffic"
              subtitle="Website visitors this week"
              comments={[]}
              className="w-full"
            >
              <AnalyticsChart 
                data={trafficData} 
                type="bar" 
                color="tertiary"
                height={250}
              />
            </ChartCard>
          </TabsContent>

          <TabsContent value="traffic">
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Traffic Analysis Coming Soon</h3>
              <p>Detailed traffic insights and user flow analysis will be available here.</p>
            </div>
          </TabsContent>

          <TabsContent value="conversion">
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Conversion Funnel Coming Soon</h3>
              <p>Step-by-step conversion analysis and optimization insights.</p>
            </div>
          </TabsContent>

          <TabsContent value="revenue">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Revenue Breakdown Coming Soon</h3>
              <p>Detailed revenue analysis by channel, product, and customer segment.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}