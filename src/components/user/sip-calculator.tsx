'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

const chartConfig = {
  invested: {
    label: 'Invested',
    color: 'hsl(var(--muted))',
  },
  returns: {
    label: 'Returns',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function SipCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(5);

  const calculateFutureValue = () => {
    const i = returnRate / 100 / 12; // monthly interest rate
    const n = timePeriod * 12; // number of months
    const M = monthlyInvestment;

    if (i === 0) {
      return {
        totalInvestment: M * n,
        estimatedReturns: 0,
        totalValue: M * n,
      };
    }

    const futureValue = M * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const totalInvestment = M * n;
    const estimatedReturns = futureValue - totalInvestment;

    return {
      totalInvestment,
      estimatedReturns,
      totalValue: futureValue,
    };
  };

  const { totalInvestment, estimatedReturns, totalValue } =
    calculateFutureValue();
  const chartData = [
    { name: 'invested', value: totalInvestment, fill: 'var(--color-invested)' },
    { name: 'returns', value: estimatedReturns, fill: 'var(--color-returns)' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">
          SIP Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="monthly-investment">Monthly Investment</Label>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(monthlyInvestment)}
              </span>
            </div>
            <Slider
              id="monthly-investment"
              min={500}
              max={100000}
              step={500}
              value={[monthlyInvestment]}
              onValueChange={vals => setMonthlyInvestment(vals[0])}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="return-rate">Expected Return Rate (% p.a.)</Label>
              <span className="text-lg font-bold text-primary">{returnRate}%</span>
            </div>
            <Slider
              id="return-rate"
              min={1}
              max={30}
              step={0.5}
              value={[returnRate]}
              onValueChange={vals => setReturnRate(vals[0])}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="time-period">Time Period (Years)</Label>
              <span className="text-lg font-bold text-primary">{timePeriod} Yr</span>
            </div>
            <Slider
              id="time-period"
              min={1}
              max={5}
              step={1}
              value={[timePeriod]}
              onValueChange={vals => setTimePeriod(vals[0])}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="text-center mt-4 space-y-2">
            <div>
              <p className="text-muted-foreground">Invested Amount</p>
              <p className="text-xl font-bold">{formatCurrency(totalInvestment)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. Returns</p>
              <p className="text-xl font-bold">{formatCurrency(estimatedReturns)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
