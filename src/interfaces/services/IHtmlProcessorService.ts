export interface IHtmlProcessorService {
  processHtml(html: string, baseUrl?: string): Promise<string>;
  extractUrls(html: string): string[];
}
