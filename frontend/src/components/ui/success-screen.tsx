import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";

interface SuccessScreenProps {
  title: string;
  description?: string;
  content: string;
  contentType?: "url" | "html";
  onReset?: () => void;
  additionalActions?: React.ReactNode;
}

export function SuccessScreen({
  title,
  description,
  content,
  contentType = "url",
  onReset,
  additionalActions,
}: SuccessScreenProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-200">
        <AlertTitle className="flex items-center text-green-800">
          <span className="mr-2">✅</span> {title}
        </AlertTitle>
        {description && (
          <AlertDescription className="text-green-700">
            {description}
          </AlertDescription>
        )}
      </Alert>

      <div className="p-4 border rounded-lg bg-slate-50">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {contentType === "url" ? "Your Shortened URL:" : "Processed HTML:"}
          </label>
          {contentType === "url" ? (
            <div className="flex items-center justify-between gap-2 p-2 bg-white border rounded-md">
              <span className="text-sm font-medium truncate flex-1">
                {content}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="h-8 gap-1 whitespace-nowrap"
              >
                {copied ? "✓ Copied" : "Copy"}
              </Button>
            </div>
          ) : (
            <div className="relative">
              <pre className="p-4 rounded-md bg-white border overflow-x-auto text-sm max-h-[400px] overflow-y-auto">
                {content}
              </pre>
              <div className="absolute top-2 right-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={copyToClipboard}
                  className="h-8"
                >
                  {copied ? "✓ Copied" : "Copy"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            {contentType === "url" ? "Shorten Another URL" : "Process Another"}
          </Button>
        )}
        {additionalActions}
      </div>
    </div>
  );
} 