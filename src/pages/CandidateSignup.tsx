import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { analyzeResume, type ResumeAnalysis } from "@/lib/gemini";
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function CandidateSignup() {
  const [step, setStep] = useState<"upload" | "form" | "email">("upload");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeAnalysis | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setIsAnalyzing(true);
      try {
        const file = acceptedFiles[0];
        const text = await file.text();
        const analysis = await analyzeResume(text);

        setResumeData(analysis);
        form.setValue("name", analysis.name);
        form.setValue("email", analysis.email);
        form.setValue("phone", analysis.phone);

        setStep("form");
      } catch (er) {
        const error = er as Error;
        toast({
          variant: "destructive",
          title: "Error analyzing resume",
          description: error.message,
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!resumeData) throw new Error("Resume data is required");

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) throw authError;

      // Create user profile
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user!.id,
        email: values.email,
        role: "candidate",
        full_name: values.name,
        phone: values.phone,
      });

      if (userError) throw userError;

      // Create candidate profile
      const { error: profileError } = await supabase
        .from("candidate_profiles")
        .insert({
          user_id: authData.user!.id,
          full_name: values.name,
          phone: values.phone,
          age_group: resumeData.ageGroup,
          career_summary: resumeData.careerSummary,
        });

      if (profileError) throw profileError;

      // Add work experience
      if (resumeData.workExperience.length > 0) {
        const { error: workError } = await supabase
          .from("work_experience")
          .insert(
            resumeData.workExperience.map((exp) => ({
              candidate_id: authData.user!.id,
              role: exp.role,
              company: exp.company,
              start_date: exp.startDate,
              end_date: exp.endDate,
              description: exp.description,
            }))
          );

        if (workError) throw workError;
      }

      // Add education
      if (resumeData.education.length > 0) {
        const { error: eduError } = await supabase.from("education").insert(
          resumeData.education.map((edu) => ({
            candidate_id: authData.user!.id,
            level: edu.level,
            school_name: edu.schoolName,
            start_date: edu.startDate,
            end_date: edu.endDate,
            gpa: edu.gpa,
            achievements: edu.achievements,
          }))
        );

        if (eduError) throw eduError;
      }

      setStep("email");
    } catch (er) {
      const error = er as Error;
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Join Aguka</h2>
          <p className="mt-2 text-gray-600">
            Let's start by analyzing your resume
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-gray-300"
                  }`}
                >
                  <input {...getInputProps()} />
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="mt-4 text-sm text-gray-600">
                        Analyzing your resume...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-sm text-gray-600">
                        Drag and drop your resume here, or click to select
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        Only PDF files are accepted
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full bg-[#0A66C2]">
                      Create Account
                    </Button>
                  </form>
                </Form>
              </Card>
            </motion.div>
          )}

          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6 text-center">
                <div className="mb-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Check your email
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  We've sent you an email with a link to verify your account.
                  Please check your inbox and click the link to continue.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  Go to Login
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
