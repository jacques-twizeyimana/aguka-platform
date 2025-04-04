import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
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

const departments = [
  { id: "software", name: "Software Developer" },
  { id: "design", name: "Designer" },
  { id: "pm", name: "Project Manager" },
];

const formSchema = z.object({
  department: z.string().min(1, "Please select a department"),
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  companyName: z.string().min(2, "Company name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function EmployerSignup() {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: "",
      fullName: "",
      email: "",
      companyName: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) throw authError;

      // Create company
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: values.companyName,
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create user profile
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user!.id,
        email: values.email,
        role: "employer",
        full_name: values.fullName,
        phone: values.phone,
        company_id: companyData.id,
      });

      if (userError) throw userError;

      toast({
        title: "Account created",
        description: "Please check your email to verify your account.",
      });

      navigate("/company-details");
    } catch (error) {
      const err = error as Error;
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Create Employer Account
          </h2>
          <p className="mt-2 text-gray-600">
            Start hiring top talent for your company
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">
            Select Department to Hire
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Card
                key={dept.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedDepartment === dept.id
                    ? "border-[#0A66C2] bg-blue-50"
                    : "hover:border-gray-300"
                }`}
                onClick={() => {
                  setSelectedDepartment(dept.id);
                  form.setValue("department", dept.id);
                }}
              >
                <div className="text-center">
                  <p className="font-medium">{dept.name}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
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
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc" {...field} />
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
                      <Input type="tel" placeholder="+1234567890" {...field} />
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
      </div>
    </div>
  );
}
