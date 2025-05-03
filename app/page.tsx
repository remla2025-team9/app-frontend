"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Check, ArrowRight, ArrowRightLeft, RefreshCcw } from "lucide-react"

const classifications = ["positive", "negative", "neutral"] as const
type Classification = typeof classifications[number]

const FormSchema = z.object({
  review: z.string().min(1, { message: "Review must not be empty." })
})

const simulateAiClassification = (reviewText: string): Classification => {
  const lowerCaseReview = reviewText.toLowerCase()
  if (
    lowerCaseReview.includes("great") ||
    lowerCaseReview.includes("excellent") ||
    lowerCaseReview.includes("love") ||
    lowerCaseReview.includes("amazing")
  ) {
    return "positive"
  } else if (
    lowerCaseReview.includes("bad") ||
    lowerCaseReview.includes("terrible") ||
    lowerCaseReview.includes("disappointing") ||
    lowerCaseReview.includes("poor")
  ) {
    return "negative"
  } else {
    return "neutral"
  }
}

export default function Home() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedReview, setSubmittedReview] = useState("")
  const [aiClassification, setAiClassification] = useState<Classification | null>(null)
  const [userClassification, setUserClassification] = useState<Classification | null>(null)
  const [editing, setEditing] = useState(false)
  const [pendingClassification, setPendingClassification] = useState<Classification | null>(null)
  const [confirmedClassification, setConfirmedClassification] = useState(false)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { review: "" }
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setSubmittedReview(data.review)
    const classification = simulateAiClassification(data.review)
    setAiClassification(classification)
    setUserClassification(classification)
    setConfirmedClassification(false)
    setIsSubmitted(true)
    toast("Thank you for submitting your review!")
  }

  const handleClassificationUpdate = (newClassification: Classification) => {
    setUserClassification(newClassification)
    setConfirmedClassification(true)
    toast.success(`Review sentiment set to: ${newClassification}`)
  }

  const handleSubmitChangedClassification = () => {
    if (pendingClassification) {
      setUserClassification(pendingClassification)
      setEditing(false)
      setConfirmedClassification(true)
      toast.success(`Review sentiment set to: ${pendingClassification}`)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setSubmittedReview("")
    setAiClassification(null)
    setUserClassification(null)
    setEditing(false)
    setConfirmedClassification(false)
    setPendingClassification(null)
    form.reset()
  }

  return (
    <div className="max-w-screen-sm mx-auto w-full px-4 sm:px-6 my-12">
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
                      <Textarea placeholder="Please enter your review here..." rows={5} {...field} />
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
              <div className="flex gap-6 justify-between items-center shadow-sm p-4 rounded-md">
                <div className="flex flex-col items-start gap-2">
                  <span className="text-sm font-medium">
                    {confirmedClassification && userClassification !== aiClassification && "AI detected sentiment was corrected to:"}
                    {confirmedClassification && userClassification === aiClassification && "AI detected sentiment was confirmed:"}
                    {!confirmedClassification && "AI detected sentiment:"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={confirmedClassification && userClassification !== aiClassification ? "destructive" : (!confirmedClassification ? "default" : "success")}>
                      {confirmedClassification && (userClassification !== aiClassification ? <X /> : <Check />)}
                      {aiClassification}
                    </Badge>
                    {confirmedClassification && userClassification !== aiClassification && (
                      <>
                        <ArrowRight className="w-4" />
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
                    <div className="flex flex-wrap gap-3 items-center">
                      <Button variant="outline" size="sm" onClick={() => handleClassificationUpdate(aiClassification!)}>
                        <Check />
                        Confirm sentiment
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => {
                        setEditing(true)
                        setPendingClassification(userClassification)
                      }}>
                        <ArrowRightLeft />
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
  )
}
