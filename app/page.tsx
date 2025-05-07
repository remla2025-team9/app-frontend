"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Check, ArrowRight, ArrowRightLeft, RefreshCcw } from "lucide-react";
import { fetchAppServiceVersion, ServiceVersionInfo, predictSentimentReview } from '@/services/appService';

const classifications = ["positive", "negative"] as const;
type Classification = typeof classifications[number];

const mapPredictionToSentiment = (prediction: number): Classification => {
  return prediction === 1 ? "positive" : "negative";
};

const FormSchema = z.object({
  review: z.string().min(1, { message: "Review must not be empty." }),
});

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedReview, setSubmittedReview] = useState("");
  const [aiClassification, setAiClassification] = useState<Classification | null>(null);
  const [userClassification, setUserClassification] = useState<Classification | null>(null);
  const [editing, setEditing] = useState(false);
  const [pendingClassification, setPendingClassification] = useState<Classification | null>(null);
  const [confirmedClassification, setConfirmedClassification] = useState(false);

  // State for service versions
  const [serviceVersions, setServiceVersions] = useState<ServiceVersionInfo | null>(null);
  const [versionsLoading, setVersionsLoading] = useState<boolean>(true);
  const [versionsError, setVersionsError] = useState<Error | null>(null);

  const appFrontendVersion = process.env.NEXT_PUBLIC_APP_VERSION || "NOT_SET";

  useEffect(() => {
    const getVersions = async () => {
      try {
        setVersionsLoading(true);
        setVersionsError(null);
        const data = await fetchAppServiceVersion();
        setServiceVersions(data);
      } catch (err) {
        setVersionsError(err instanceof Error ? err : new Error(String(err)));
        console.error("Error fetching app and model service version information:", err);
        toast.error("Failed to load app and model service version information.");
      } finally {
        setVersionsLoading(false);
      }
    };

    getVersions();
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { review: "" },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const prediction = await predictSentimentReview(data.review);
      
      if (!prediction || typeof prediction.prediction !== 'number') {
        throw new Error('Invalid prediction response from service');
      }
      const classification = mapPredictionToSentiment(prediction.prediction);
      setIsSubmitted(true);
      setSubmittedReview(data.review);
      setAiClassification(classification);
      setUserClassification(classification);
      setConfirmedClassification(false);
      toast.success("Thank you for submitting your review!");
    } catch (err) {
      setIsSubmitted(false);
      setSubmittedReview("");
      
      console.error("Error predicting review sentiment:", err);
      toast.error(
        "Failed to predict review sentiment. Please try again later."
      );
    }
  }

  const handleClassificationUpdate = (newClassification: Classification) => {
    setUserClassification(newClassification);
    setConfirmedClassification(true);
    toast.success(`Review sentiment set to: ${newClassification}`);
  };

  const handleSubmitChangedClassification = () => {
    if (pendingClassification) {
      setUserClassification(pendingClassification);
      setEditing(false);
      setConfirmedClassification(true);
      toast.success(`Review sentiment set to: ${pendingClassification}`);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSubmittedReview("");
    setAiClassification(null);
    setUserClassification(null);
    setEditing(false);
    setConfirmedClassification(false);
    setPendingClassification(null);
    form.reset();
  };

  return (
    <div className="max-w-screen-sm mx-auto w-full px-4 sm:px-6 my-12">
      <div className="flex flex-col mb-6">
        <p className="text-xs text-muted-foreground">
          App frontend version: <span className="font-semibold ml-1 text-blue-500">{appFrontendVersion}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          App service version: 
          {versionsLoading && <span className="font-semibold ml-1 text-foreground">Loading...</span>}
          {versionsError && <span className="font-semibold ml-1 text-destructive">Disconnected</span>}
          {!versionsLoading && !versionsError && serviceVersions && <span className="font-semibold ml-1 text-blue-500">{serviceVersions['app-service-version']}</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          Model service version: 
          {versionsLoading && <span className="font-semibold ml-1 text-foreground">Loading...</span>}
          {versionsError && <span className="font-semibold ml-1 text-destructive">Disconnected</span>}
          {!versionsLoading && !versionsError && serviceVersions && <span className="font-semibold ml-1 text-blue-500">{serviceVersions['model-service-version']}</span>}
        </p>
      </div>
      {!isSubmitted ? (
        <>
          <h1 className="text-display-sm mb-2">Rate your visit to our restaurant</h1>
          <p className="text-sm text-muted-foreground mb-8">
            We value your feedback! Please take a moment to share your experience with us.
            Your review will help us improve our service and provide a better experience for our customers.
            Thank you for your time!
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
              <FormField
                control={form.control}
                name="review"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Please enter your review here..." rows={5} disabled={form.formState.isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit review"}
              </Button>
            </form>
          </Form>
        </>
      ) : (
        <>
          <h1 className="text-display-sm mb-4">Thank you for your review!</h1>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Your submitted review:</p>
            <blockquote className="border-l-4 text-md border-border pl-4 text-muted-foreground bg-muted/50 p-3 rounded-md">
              {submittedReview}
            </blockquote>
          </div>
          <Button variant="outline" size="sm" onClick={resetForm}>
            <RefreshCcw />
            Submit another review
          </Button>
          <Separator className="my-8" />
          {aiClassification && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Review sentiment</h2>
              <p className="text-sm text-muted-foreground">
                Our AI model analyzed your review. Please confirm if the AI detected sentiment is correct or select a different sentiment.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center shadow-sm p-4 rounded-md"> {/* Adjusted for responsiveness */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm font-medium">
                    {confirmedClassification && userClassification !== aiClassification && "AI detected sentiment was corrected to:"}
                    {confirmedClassification && userClassification === aiClassification && "AI detected sentiment was confirmed:"}
                    {!confirmedClassification && "AI detected sentiment:"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={confirmedClassification && userClassification !== aiClassification ? "destructive" : (!confirmedClassification ? "default" : "success")}>
                      {confirmedClassification && (userClassification !== aiClassification ? <X className="mr-1 h-3 w-3" /> : <Check className="mr-1 h-3 w-3" />)} {/* Added margin for icon */}
                      {aiClassification}
                    </Badge>
                    {confirmedClassification && userClassification !== aiClassification && (
                      <>
                        <ArrowRight />
                        <Badge variant="default">{userClassification}</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2"> 
                  {editing ? (
                    <div className="flex items-center gap-3">
                      <Select onValueChange={(value) => setPendingClassification(value as Classification)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select sentiment" />
                        </SelectTrigger>
                        <SelectContent>
                          {classifications.map((classification) => (
                            <SelectItem key={classification} value={classification}>
                              {classification}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={handleSubmitChangedClassification} disabled={!pendingClassification}>
                        Change
                      </Button>
                    </div>
                  ) : (!confirmedClassification && (
                    <div className="flex flex-wrap gap-2 items-center"> 
                      <Button variant="outline" size="sm" onClick={() => handleClassificationUpdate(aiClassification!)}>
                        <Check />
                        Confirm sentiment
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => {
                        setEditing(true);
                        setPendingClassification(userClassification);
                      }}>
                        <ArrowRightLeft/>
                        Change
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}