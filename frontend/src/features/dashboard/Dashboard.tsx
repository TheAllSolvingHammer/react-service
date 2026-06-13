import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the shape of the data we expect from your BFF
interface DashboardData {
    account?: any;
    profile: {
        id: string;
        mode: string;
        details: any;
    };
    activity: {
        totalApplications: number;
        applications: any[];
    };
    aiInsights: {
        matchResults: any[];
    };
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const mockUserId = "f11e9632-adad-40f6-805b-c30cd2bfd15c";
                localStorage.setItem("userId", mockUserId);

                const response = await apiClient.get("/bff/dashboard");
                setData(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data. Is the API Gateway running?");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-xl font-semibold text-slate-500 animate-pulse">
                    Loading AI Insights & Profile Data...
                </div>
            </div>
        );
    }

    if (error || !data) {
        return <div className="text-red-500 font-medium">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Dynamic Header based on the candidate type */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-wider ${
                    data.profile.mode === 'ACADEMIC'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                }`}>
          {data.profile.mode} MODE
        </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Metric Card 1: Applications */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Active Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.activity.totalApplications}</div>
                        <p className="text-xs text-slate-400 mt-1">Processed by Opportunity Service</p>
                    </CardContent>
                </Card>

                {/* Metric Card 2: AI Matches */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total AI Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data.aiInsights.matchResults.length}</div>
                        <p className="text-xs text-slate-400 mt-1">Analyzed by Gemini AI Engine</p>
                    </CardContent>
                </Card>
            </div>

            {/* AI Insights Section */}
            <h2 className="text-xl font-semibold mt-10 mb-4 border-b pb-2">Recent AI Evaluations</h2>
            <div className="grid gap-4">
                {data.aiInsights.matchResults.length === 0 ? (
                    <p className="text-slate-500 italic">No matches processed yet.</p>
                ) : (
                    data.aiInsights.matchResults.map((match, index) => (
                        <Card key={index}>
                            <CardContent className="p-6 flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">Opportunity Match Score</h3>
                                    <p className="text-slate-600 mt-2">{match.reason}</p>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {match.score}%
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}