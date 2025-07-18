import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery, useSubscription } from '@apollo/client';
import {
  File,
  ListFilter,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AnalyticsChart } from './AnalyticsChart';
import { MetricCard } from './MetricCard';
import { ChartCard } from './ChartCard'; // Import ChartCard

// GraphQL query to fetch dashboard data
const GET_DASHBOARD_QUERY = gql`
  query GetDashboard($id: ID!) {
    dashboard(id: $id) {
      id
      name
      status
      charts {
        id
        type
        data
        position
      }
    }
  }
`;

// GraphQL subscription to listen for updates
const DASHBOARD_UPDATED_SUBSCRIPTION = gql`
  subscription OnDashboardUpdated($dashboardId: ID!) {
    dashboardUpdated(dashboardId: $dashboardId) {
      id
      name
      status
      charts {
        id
        type
        data
        position
      }
    }
  }
`;

export function Dashboard() {
  const { dashboardId } = useParams<{ dashboardId: string }>();

  const { loading, error, data } = useQuery(GET_DASHBOARD_QUERY, {
    variables: { id: dashboardId },
    skip: !dashboardId,
  });

  const { data: subscriptionData, error: subscriptionError } = useSubscription(
    DASHBOARD_UPDATED_SUBSCRIPTION,
    { variables: { dashboardId }, skip: !dashboardId, }
  );

  useEffect(() => {
    if (subscriptionData) {
      console.log('Received real-time update:', subscriptionData);
    }
  }, [subscriptionData]);


  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error loading dashboard: {error.message}</p>;
  if (subscriptionError) return <p>Subscription Error: {subscriptionError.message}</p>;

  const dashboard = data?.dashboard;

  if (!dashboard) return <p>No dashboard found.</p>;

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Chart
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>{dashboard.name}</CardTitle>
              <CardDescription>
                A collaborative space for your team's analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboard.charts && dashboard.charts.map((chart: any) => {
                  try {
                    const chartData = JSON.parse(chart.data);
                    if (chart.type === 'METRIC') {
                      // Corrected: Added missing props with default fallbacks
                      return (
                        <MetricCard 
                          key={chart.id} 
                          title={chartData.title} 
                          value={chartData.value} 
                          change={chartData.change}
                          changeType={chartData.changeType || 'increase'}
                          timeframe={chartData.timeframe || 'since last month'}
                          comments={chartData.comments || 0}
                        />
                      );
                    }
                    if (chart.type === 'LINE' || chart.type === 'BAR') {
                      // Corrected: Wrapped AnalyticsChart in ChartCard
                      return (
                        <ChartCard 
                          key={chart.id}
                          title={chartData.title}
                          description={chartData.description || `An example ${chart.type.toLowerCase()} chart.`}
                        >
                          <AnalyticsChart data={chartData.series} type={'area'} />
                        </ChartCard>
                      );
                    }
                  } catch (e) {
                    console.error("Failed to parse chart data:", chart.data);
                    return <div key={chart.id}>Invalid chart data</div>;
                  }
                  return null;
                })}
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{dashboard.charts?.length || 0}</strong> of <strong>{dashboard.charts?.length || 0}</strong> charts
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
