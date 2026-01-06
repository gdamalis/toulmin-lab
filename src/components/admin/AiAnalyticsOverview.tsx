'use client';

import { 
  Card, 
  Title, 
  Text, 
  TabGroup, 
  TabList, 
  Tab, 
  TabPanels, 
  TabPanel,
  AreaChart, 
  BarChart, 
  DonutChart,
} from '@tremor/react';
import { useAiAnalytics, type AiAnalyticsFilters } from '@/hooks/useAiAnalytics';
import { StatCard, StatCardGrid } from '@/components/ui';
import { Typography } from '@/components/ui/Typography';
import {
  CpuChipIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useState, useMemo } from 'react';

/**
 * Feature display names
 */
const FEATURE_LABELS: Record<string, string> = {
  coach_chat: 'Coach Chat',
  coach_title: 'Title Generation',
};

/**
 * Format provider:model for display
 */
function formatProviderModel(providerModel: string): string {
  const [provider, model] = providerModel.split(':');
  const providerLabel = provider?.charAt(0).toUpperCase() + provider?.slice(1);
  return `${providerLabel}: ${model}`;
}

/**
 * Model filter dropdown
 */
function ModelFilter({
  models,
  selectedModel,
  onChange,
}: Readonly<{
  models: Array<{ providerModel: string; requests: number }>;
  selectedModel: string | undefined;
  onChange: (model: string | undefined) => void;
}>) {
  return (
    <div className="flex items-center gap-2">
      <FunnelIcon className="h-5 w-5 text-gray-400" />
      <select
        value={selectedModel ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="block rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All Models</option>
        {models.map((model) => (
          <option key={model.providerModel} value={model.providerModel}>
            {formatProviderModel(model.providerModel)} ({model.requests})
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Date range presets
 */
function DateRangePresets({
  onChange,
}: Readonly<{
  onChange: (from: string, to: string) => void;
}>) {
  const presets = [
    { label: '7 days', days: 7 },
    { label: '14 days', days: 14 },
    { label: '30 days', days: 30 },
  ];

  return (
    <div className="flex gap-2">
      {presets.map((preset) => (
        <button
          key={preset.days}
          onClick={() => {
            const now = new Date();
            const from = new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000);
            onChange(from.toISOString(), now.toISOString());
          }}
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

/**
 * AI Analytics Overview Component
 */
export function AiAnalyticsOverview() {
  const [filters, setFilters] = useState<AiAnalyticsFilters>({});
  const { data, isLoading, error, refresh } = useAiAnalytics(filters);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data) return [];
    const series = data.series;
    if (!series) return [];
    return series.map((point) => ({
      date: point.date,
      'Total Requests': point.requests,
      'Unique Users': point.uniqueUsers,
      'Successful': point.successCount,
      'Errors': point.errorCount,
    }));
  }, [data]);

  // Prepare model breakdown for donut chart
  const modelChartData = useMemo(() => {
    if (!data) return [];
    const models = data.models;
    if (!models) return [];
    return models.map((model) => ({
      name: formatProviderModel(model.providerModel),
      value: model.requests,
    }));
  }, [data]);

  // Prepare feature breakdown for bar chart
  const featureChartData = useMemo(() => {
    if (!data) return [];
    const features = data.features;
    if (!features) return [];
    return features.map((feature) => ({
      name: FEATURE_LABELS[feature.feature] ?? feature.feature,
      Requests: feature.requests,
      'Success Rate': feature.successRate,
    }));
  }, [data]);

  const handleFilterChange = (newFilters: Partial<AiAnalyticsFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <StatCardGrid>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-gray-200" />
            ))}
          </StatCardGrid>
          <div className="h-80 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <Text className="text-red-700">{error}</Text>
        <button
          onClick={refresh}
          className="mt-2 text-sm text-red-600 underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
        <Text className="mt-2 text-gray-600">No AI usage data available yet.</Text>
      </div>
    );
  }

  const successRate = data.totals.totalRequests > 0
    ? Math.round((data.totals.totalSuccess / data.totals.totalRequests) * 100)
    : 0;

  // Determine change type based on success rate
  const getSuccessRateChangeType = (): 'increase' | 'neutral' | 'decrease' => {
    if (successRate >= 90) return 'increase';
    if (successRate >= 70) return 'neutral';
    return 'decrease';
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography variant="h3">AI Usage Analytics</Typography>
        <div className="flex flex-wrap items-center gap-4">
          <DateRangePresets
            onChange={(from, to) => handleFilterChange({ from, to })}
          />
          {data.models.length > 0 && (
            <ModelFilter
              models={data.models}
              selectedModel={filters.model}
              onChange={(model) => handleFilterChange({ model })}
            />
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <StatCardGrid>
        <StatCard
          id={1}
          name="Total AI Requests"
          stat={data.totals.totalRequests.toLocaleString()}
          icon={CpuChipIcon}
          change={`${successRate}% success`}
          changeType={getSuccessRateChangeType()}
        />
        <StatCard
          id={2}
          name="Unique Users"
          stat={data.totals.totalUniqueUsers.toLocaleString()}
          icon={UserGroupIcon}
        />
        <StatCard
          id={3}
          name="Successful Requests"
          stat={data.totals.totalSuccess.toLocaleString()}
          icon={CheckCircleIcon}
          changeType="increase"
        />
        <StatCard
          id={4}
          name="Errors & Denied"
          stat={(data.totals.totalErrors + data.totals.totalQuotaDenied + data.totals.totalRateLimited).toLocaleString()}
          icon={ExclamationTriangleIcon}
          changeType={data.totals.totalErrors > 0 ? 'decrease' : 'neutral'}
        />
      </StatCardGrid>

      {/* Tabs for different views */}
      <TabGroup>
        <TabList className="mb-4">
          <Tab>Daily Trend</Tab>
          <Tab>By Model</Tab>
          <Tab>By Feature</Tab>
          <Tab>Top Users</Tab>
        </TabList>
        <TabPanels>
          {/* Daily Trend */}
          <TabPanel>
            <Card>
              <Title>Daily AI Requests</Title>
              <Text>Total requests and unique users over time</Text>
              <AreaChart
                className="mt-4 h-80"
                data={chartData}
                index="date"
                categories={['Total Requests', 'Unique Users']}
                colors={['blue', 'emerald']}
                valueFormatter={(value) => value.toLocaleString()}
                showLegend
                showGridLines
                curveType="monotone"
              />
            </Card>
          </TabPanel>

          {/* By Model */}
          <TabPanel>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <Title>Requests by Model</Title>
                <Text>Distribution of AI requests across models</Text>
                <DonutChart
                  className="mt-4 h-72"
                  data={modelChartData}
                  category="value"
                  index="name"
                  valueFormatter={(value) => value.toLocaleString()}
                  colors={['blue', 'cyan', 'indigo', 'violet', 'fuchsia']}
                  showLabel
                  showAnimation
                />
              </Card>
              <Card>
                <Title>Model Details</Title>
                <div className="mt-4 space-y-3">
                  {data.models.map((model) => (
                    <div
                      key={model.providerModel}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                    >
                      <div>
                        <Text className="font-medium">
                          {formatProviderModel(model.providerModel)}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {model.uniqueUsers} users • {model.successRate.toFixed(1)}% success
                        </Text>
                      </div>
                      <Text className="font-semibold">
                        {model.requests.toLocaleString()}
                      </Text>
                    </div>
                  ))}
                  {data.models.length === 0 && (
                    <Text className="text-gray-500">No model data available</Text>
                  )}
                </div>
              </Card>
            </div>
          </TabPanel>

          {/* By Feature */}
          <TabPanel>
            <Card>
              <Title>Requests by Feature</Title>
              <Text>Breakdown of AI usage by feature type</Text>
              <BarChart
                className="mt-4 h-72"
                data={featureChartData}
                index="name"
                categories={['Requests']}
                colors={['blue']}
                valueFormatter={(value) => value.toLocaleString()}
                showLegend={false}
              />
              <div className="mt-4 space-y-2">
                {data.features.map((feature) => (
                  <div
                    key={feature.feature}
                    className="flex items-center justify-between text-sm"
                  >
                    <Text>{FEATURE_LABELS[feature.feature] ?? feature.feature}</Text>
                    <Text className="text-gray-500">
                      {feature.uniqueUsers} users • {feature.successRate.toFixed(1)}% success
                    </Text>
                  </div>
                ))}
              </div>
            </Card>
          </TabPanel>

          {/* Top Users */}
          <TabPanel>
            <Card>
              <Title>Top Users by AI Usage</Title>
              <Text>Users with the most AI requests in this period</Text>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        User ID
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Requests
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Success
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Errors
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Last Request
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {data.topUsers.map((user, index) => (
                      <tr key={user.uid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-mono text-gray-900">
                          {user.uid.slice(0, 12)}...
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          {user.requests.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-green-600">
                          {user.successCount.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-red-600">
                          {user.errorCount.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-500">
                          {new Date(user.lastRequestAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {data.topUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No user data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
