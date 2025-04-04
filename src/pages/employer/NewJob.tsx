import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { analyzeJobForPool } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  specializations: Specialization[];
}

interface Specialization {
  id: string;
  name: string;
}

const formSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requiredCandidates: z.number().min(1, "At least 1 candidate is required"),
  level: z.enum(["junior", "mid", "senior", "expert"]),
  startDate: z.string().min(1, "Start date is required"),
  applicationsCloseAt: z.string().min(1, "Application deadline is required"),
  categoryId: z.string().min(1, "Category is required"),
  specializationId: z.string().min(1, "Specialization is required"),
});

const levels = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "expert", label: "Expert" },
];

export default function NewJob() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      requiredCandidates: 1,
      level: "mid",
      startDate: "",
      applicationsCloseAt: "",
      categoryId: "",
      specializationId: "",
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("job_categories")
        .select(
          `
          id,
          name,
          job_specializations (
            id,
            name
          )
        `
        )
        .order("name");

      if (error) throw error;

      setCategories(
        data.map((category) => ({
          ...category,
          specializations: category.job_specializations,
        }))
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch categories",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    setIsSubmitting(true);
    setIsAnalyzing(true);

    try {
      // Analyze job for pool classification
      const poolAnalysis = await analyzeJobForPool(
        values.title,
        values.description,
        values.level
      );

      // Find or create pool
      const { data: existingPool } = await supabase
        .from("job_pools")
        .select("id")
        .ilike("title", poolAnalysis.suggestedPool.title)
        .single();

      let poolId: string;

      if (existingPool) {
        // Check if pool is still active
        const { data: activeJobs } = await supabase
          .from("jobs")
          .select("status")
          .eq("pool_id", existingPool.id)
          .in("status", ["open", "pending"]);

        // Create new pool if existing one has inactive jobs
        if (!activeJobs?.length) {
          const { data: newPool, error: poolError } = await supabase
            .from("job_pools")
            .insert({
              title: poolAnalysis.suggestedPool.title,
              description: poolAnalysis.suggestedPool.description,
            })
            .select()
            .single();

          if (poolError) throw poolError;
          poolId = newPool.id;
        } else {
          poolId = existingPool.id;
        }
      } else {
        // Create new pool
        const { data: newPool, error: poolError } = await supabase
          .from("job_pools")
          .insert({
            title: poolAnalysis.suggestedPool.title,
            description: poolAnalysis.suggestedPool.description,
          })
          .select()
          .single();

        if (poolError) throw poolError;
        poolId = newPool.id;
      }

      // Create job
      const { error: jobError } = await supabase.from("jobs").insert({
        employer_id: user.id,
        title: values.title,
        description: values.description,
        required_candidates: values.requiredCandidates,
        level: values.level,
        start_date: values.startDate,
        applications_close_at: values.applicationsCloseAt,
        status: "draft",
        publication_status: "draft",
        pool_id: poolId,
        category_id: values.categoryId,
        specialization_id: values.specializationId,
      });

      if (jobError) throw jobError;

      toast({
        title: "Success",
        description: "Job created successfully",
      });

      navigate("/employer/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  const selectedCategory = form.watch("categoryId");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post New Job</h1>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue("specializationId", "");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specializationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedCategory}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories
                            .find((c) => c.id === selectedCategory)
                            ?.specializations.map((spec) => (
                              <SelectItem key={spec.id} value={spec.id}>
                                {spec.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Senior Software Engineer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the role, responsibilities, and requirements..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="requiredCandidates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Candidates</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicationsCloseAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/employer/dashboard")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0A66C2]"
                  disabled={isSubmitting}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : isSubmitting ? (
                    "Creating..."
                  ) : (
                    "Create Job"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
