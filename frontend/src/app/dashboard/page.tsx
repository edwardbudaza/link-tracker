"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    recentUrls: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      const fetchDashboardData = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/urls`,
            {
              headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
              },
            }
          );
          
          if (response.data?.urls) {
            const urls = response.data.urls;
            const totalClicks = urls.reduce((sum: number, url: any) => sum + (url.clicks || 0), 0);
            
            setStats({
              totalUrls: urls.length,
              totalClicks,
              recentUrls: urls.slice(0, 5),
            });
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center p-12">Loading dashboard data...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total URLs</CardTitle>
            <CardDescription>All your shortened URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalUrls}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Clicks</CardTitle>
            <CardDescription>Sum of all link clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalClicks}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Average clicks per URL</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats.totalUrls ? (stats.totalClicks / stats.totalUrls).toFixed(1) : "0"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent URLs</CardTitle>
          <CardDescription>Your most recently created links</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentUrls.length === 0 ? (
            <p className="text-muted-foreground">No URLs created yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentUrls.map((url: any) => (
                <div key={url._id} className="flex items-start justify-between border-b pb-3">
                  <div className="space-y-1">
                    <p className="font-medium">{url.originalUrl}</p>
                    <p className="text-sm text-muted-foreground">
                      {`${process.env.NEXT_PUBLIC_API_URL}/${url.shortId}`}
                    </p>
                  </div>
                  <div className="text-sm">
                    {url.clicks || 0} clicks
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 