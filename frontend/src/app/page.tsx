"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { toast } from "sonner";
import { SuccessScreen } from "@/components/ui/success-screen";

const urlSchema = z.object({
  originalUrl: z.string().url("Please enter a valid URL"),
});

type UrlFormValues = z.infer<typeof urlSchema>;

export default function HomePage() {
  const { data: session } = useSession();
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [urlId, setUrlId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      originalUrl: "",
    },
  });

  async function onSubmit(data: UrlFormValues) {
    try {
      setLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/urls`;
      let headers = {};
      
      // Only add auth if we have a session
      if (session && session.user.accessToken) {
        headers = { Authorization: `Bearer ${session.user.accessToken}` };
      }

      try {
        const response = await axios.post(apiUrl, data, { headers });
        
        if (response.data && response.data.shortUrl) {
          setShortenedUrl(response.data.shortUrl);
          setOriginalUrl(data.originalUrl);
          setUrlId(response.data.id);
          toast.success("URL shortened successfully!");
        }
      } catch (error) {
        // If auth failed, try again without auth
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log("Auth token expired, trying anonymous request");
          const response = await axios.post(apiUrl, data);
          
          if (response.data && response.data.shortUrl) {
            setShortenedUrl(response.data.shortUrl);
            setOriginalUrl(data.originalUrl);
            setUrlId(response.data.id);
            toast.success("URL shortened successfully!");
          }
        } else {
          throw error; // re-throw for the outer catch
        }
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error("Failed to shorten URL. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard!");
    }
  };

  const resetForm = () => {
    form.reset();
    setShortenedUrl(null);
    setOriginalUrl(null);
    setUrlId(null);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Track Your Links with Precision
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Shorten URLs, process HTML content, and gain valuable insights with 
          detailed analytics on every click.
        </p>

        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Shorten URL</CardTitle>
            <CardDescription>
              Enter a long URL to create a shortened, trackable link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!shortenedUrl ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name="originalUrl"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              prefix="🔗"
                              placeholder="https://example.com/very/long/url" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={loading}>
                      {loading ? "Shortening..." : "Shorten →"}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <SuccessScreen
                title="Your URL has been shortened!"
                description={`Your long URL ${originalUrl} has been shortened successfully.`}
                content={shortenedUrl}
                contentType="url"
                onReset={resetForm}
                additionalActions={
                  session && urlId ? (
                    <Button variant="ghost" asChild>
                      <Link href={`/urls#${urlId}`}>
                        View in Dashboard →
                      </Link>
                    </Button>
                  ) : null
                }
              />
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
          <Card className="group hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle>Shorten URLs</CardTitle>
              <CardDescription>
                Create short, memorable links that redirect to your original URLs
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Link href="/html-processor" className="block group">
            <Card className="h-full group-hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Process HTML</CardTitle>
                <CardDescription>
                  Automatically replace links in HTML content with tracked links
                </CardDescription>
              </CardHeader>
              <CardFooter className="pb-4">
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  Try It →
                </Button>
              </CardFooter>
            </Card>
          </Link>
          
          <Link href={session ? "/analytics" : "/login"} className="block group">
            <Card className="h-full group-hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Track clicks with rich data on geography, devices, and more
                </CardDescription>
              </CardHeader>
              <CardFooter className="pb-4">
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {session ? "View Analytics →" : "Sign In →"}
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
