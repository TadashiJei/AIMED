import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface BPReading {
  systolic: number;
  diastolic: number;
  heart_rate: number;
  timestamp: string;
}

interface BPTrends {
  average_systolic: number;
  average_diastolic: number;
  max_systolic: number;
  max_diastolic: number;
  min_systolic: number;
  min_diastolic: number;
  readings_count: number;
  abnormal_readings: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  time_patterns: {
    morning_average: { systolic: number; diastolic: number };
    evening_average: { systolic: number; diastolic: number };
    morning_surge: number | null;
  };
  activity_patterns: {
    [activity: string]: {
      systolic: { mean: number; std: number };
      diastolic: { mean: number; std: number };
    };
  };
  risk_factors: {
    description: string;
    recommendation: string;
    severity: 'high' | 'moderate' | 'low';
  }[];
  variability: { systolic: number; diastolic: number };
  correlations: { heart_rate_bp: number };
}

export default function LiveBPMonitor({ userId }: { userId: string }) {
  const [bpReadings, setBpReadings] = useState<BPReading[]>([]);
  const [currentReading, setCurrentReading] = useState<BPReading | null>(null);
  const [trends, setTrends] = useState<BPTrends | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    const connectWebSocket = () => {
      ws = new WebSocket(`ws://localhost:8888/ws/bp/${userId}`);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        const data: BPReading = JSON.parse(event.data);
        setCurrentReading(data);
        setBpReadings((prev) => [...prev, data].slice(-20)); // Keep last 20 readings
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Try to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        setError('Connection error. Retrying...');
        ws.close();
      };
    };

    connectWebSocket();

    // Fetch BP trends
    const fetchTrends = async () => {
      try {
        const response = await fetch(`http://localhost:8888/api/bp/trends/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setTrends(data);
        }
      } catch (error) {
        console.error('Error fetching BP trends:', error);
      }
    };

    fetchTrends();
    const trendsInterval = setInterval(fetchTrends, 300000); // Update trends every 5 minutes

    return () => {
      ws.close();
      clearInterval(trendsInterval);
    };
  }, [userId]);

  const getBPStatus = (systolic: number, diastolic: number): {
    status: string;
    color: string;
  } => {
    if (systolic >= 140 || diastolic >= 90) {
      return { status: 'High', color: 'text-red-600' };
    }
    if (systolic <= 90 || diastolic <= 60) {
      return { status: 'Low', color: 'text-yellow-600' };
    }
    return { status: 'Normal', color: 'text-green-600' };
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Live Blood Pressure Monitor</h2>
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected to Apple Watch' : 'Connecting...'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Current Reading */}
      {currentReading && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Systolic</div>
            <div className="text-2xl font-semibold">{currentReading.systolic}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Diastolic</div>
            <div className="text-2xl font-semibold">{currentReading.diastolic}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Heart Rate</div>
            <div className="text-2xl font-semibold">{currentReading.heart_rate}</div>
          </div>
          <div className="col-span-3">
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className={`text-lg font-semibold ${
              getBPStatus(currentReading.systolic, currentReading.diastolic).color
            }`}>
              {getBPStatus(currentReading.systolic, currentReading.diastolic).status}
            </div>
          </div>
        </div>
      )}

      {/* BP Chart */}
      <div className="h-64 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bpReadings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            />
            <YAxis domain={[40, 200]} />
            <Tooltip
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#ef4444"
              name="Systolic"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#3b82f6"
              name="Diastolic"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trends */}
      {trends && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">30-Day Trends</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Average BP</div>
              <div className="text-lg font-medium">
                {Math.round(trends.average_systolic)}/{Math.round(trends.average_diastolic)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Readings</div>
              <div className="text-lg font-medium">
                {trends.readings_count} total
                {trends.abnormal_readings > 0 && (
                  <span className="text-red-600 text-sm ml-2">
                    ({trends.abnormal_readings} abnormal)
                  </span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Range</div>
              <div className="text-lg font-medium">
                {trends.min_systolic}/{trends.min_diastolic} - {trends.max_systolic}/
                {trends.max_diastolic}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Trend</div>
              <div className="text-lg font-medium">
                <span
                  className={
                    trends.trend === 'increasing'
                      ? 'text-red-600'
                      : trends.trend === 'decreasing'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                >
                  {trends.trend.charAt(0).toUpperCase() + trends.trend.slice(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Analytics */}
      {trends && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Analytics</h3>
          
          {/* Time Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Time Patterns</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Morning Average:</span>
                  <span className="ml-2 font-medium">
                    {trends.time_patterns.morning_average.systolic}/
                    {trends.time_patterns.morning_average.diastolic}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Evening Average:</span>
                  <span className="ml-2 font-medium">
                    {trends.time_patterns.evening_average.systolic}/
                    {trends.time_patterns.evening_average.diastolic}
                  </span>
                </div>
                {trends.time_patterns.morning_surge && (
                  <div>
                    <span className="text-sm text-gray-500">Morning Surge:</span>
                    <span className={`ml-2 font-medium ${
                      trends.time_patterns.morning_surge > 20 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {Math.round(trends.time_patterns.morning_surge)} mmHg
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Patterns */}
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Activity Impact</h4>
              <div className="space-y-2">
                {Object.entries(trends.activity_patterns).map(([activity, stats]) => (
                  <div key={activity}>
                    <span className="text-sm text-gray-500 capitalize">{activity}:</span>
                    <span className="ml-2 font-medium">
                      {Math.round(stats.systolic.mean)}/{Math.round(stats.diastolic.mean)}
                      <span className="text-sm text-gray-400 ml-1">
                        ±{Math.round(stats.systolic.std)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {trends.risk_factors.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Factors</h4>
              <div className="space-y-4">
                {trends.risk_factors.map((risk, index) => (
                  <div key={index} className={`p-3 rounded-md ${
                    risk.severity === 'high' ? 'bg-red-50' :
                    risk.severity === 'moderate' ? 'bg-yellow-50' : 'bg-blue-50'
                  }`}>
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 mr-2 ${
                        risk.severity === 'high' ? 'bg-red-600' :
                        risk.severity === 'moderate' ? 'bg-yellow-600' : 'bg-blue-600'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{risk.description}</div>
                        <div className="text-sm text-gray-600 mt-1">{risk.recommendation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variability and Correlations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">BP Variability</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Systolic:</span>
                  <span className={`ml-2 font-medium ${
                    trends.variability.systolic > 15 ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    ±{Math.round(trends.variability.systolic)} mmHg
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Diastolic:</span>
                  <span className={`ml-2 font-medium ${
                    trends.variability.diastolic > 10 ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    ±{Math.round(trends.variability.diastolic)} mmHg
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Correlations</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Heart Rate - BP:</span>
                  <span className="ml-2 font-medium">
                    {(trends.correlations.heart_rate_bp * 100).toFixed(1)}% correlation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
