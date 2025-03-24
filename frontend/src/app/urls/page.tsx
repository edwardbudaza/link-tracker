"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function URLsPage() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My URLs</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Shortened URLs</CardTitle>
          <CardDescription>
            Manage all your shortened links in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            URL management functionality coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 