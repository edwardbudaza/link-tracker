"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { SuccessScreen } from "@/components/ui/success-screen";

const htmlProcessorSchema = z.object({
  htmlContent: z.string().min(1, "HTML content is required"),
});

type HTMLProcessorFormValues = z.infer<typeof htmlProcessorSchema>;

export default function HTMLProcessorPage() {
  const { data: session } = useSession();
  const [processedHtml, setProcessedHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<HTMLProcessorFormValues>({
    resolver: zodResolver(htmlProcessorSchema),
    defaultValues: {
      htmlContent: "",
    },
  });

  async function onSubmit(data: HTMLProcessorFormValues) {
    try {
      setLoading(true);
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/urls/process-html`;
      let headers = {};

      // Only add auth if we have a session
      if (session && session.user.accessToken) {
        headers = { Authorization: `Bearer ${session.user.accessToken}` };
      }

      try {
        const response = await axios.post(apiUrl, data, { headers });

        if (response.data && response.data.processedHtml) {
          setProcessedHtml(response.data.processedHtml);
          toast.success("HTML processed successfully!");
        }
      } catch (error) {
        // If auth failed, try again without auth
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log("Auth token expired, trying anonymous request");
          const response = await axios.post(apiUrl, data);

          if (response.data && response.data.processedHtml) {
            setProcessedHtml(response.data.processedHtml);
            toast.success("HTML processed successfully!");
          }
        } else {
          throw error; // re-throw for the outer catch
        }
      }
    } catch (error) {
      console.error("Error processing HTML:", error);
      toast.error("Failed to process HTML content. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    form.reset();
    setProcessedHtml(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">HTML Processor</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Process HTML Content</CardTitle>
          <CardDescription>
            Replace all links in HTML content with trackable shortened URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!processedHtml ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="htmlContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="<a href='https://example.com'>Example</a>"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? "Processing..." : "Process HTML"}
                </Button>
              </form>
            </Form>
          ) : (
            <SuccessScreen
              title="HTML Processed Successfully"
              description="Your HTML content has been processed. All links have been replaced with trackable shortened URLs."
              content={processedHtml}
              contentType="html"
              onReset={resetForm}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Paste your HTML content in the editor</li>
            <li>
              Click "Process HTML" to replace all links with trackable URLs
            </li>
            <li>Copy the processed HTML and use it on your website</li>
          </ol>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            All links in your HTML will be replaced with trackable URLs from our
            service. When users click on these links, you'll be able to see
            statistics in your analytics dashboard.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}