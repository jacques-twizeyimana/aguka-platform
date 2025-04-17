import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import EmployerLayout from "./Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  publication_status: string;
  pool_id: string;
}

interface Application {
  id: string;
  candidate: {
    id: string;
    full_name: string;
    email: string;
    recent_marks: number;
  };
  status: string;
  created_at: string;
}

export default function JobDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      // Fetch job details
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (jobError) throw jobError;
      setJob(jobData);

      // Fetch applications with candidate details
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .select(
          `
          id,
          status,
          created_at,
          candidate:candidate_id (
            id,
            full_name,
            email,
            recent_marks
          )
        `
        )
        .eq("job_id", id)
        .order("created_at", { ascending: false });

      if (appError) throw appError;
      // @ts-ignore
      setApplications(appData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      const { error } = await supabase
        .from("jobs")
        .update({ publication_status: "published" })
        .eq("id", id);

      if (error) throw error;

      setJob((prev) =>
        prev ? { ...prev, publication_status: "published" } : null
      );

      toast({
        title: "Success",
        description: "Job published successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleClosePool = async () => {
    try {
      // Close all jobs in the pool
      const { error: jobError } = await supabase
        .from("jobs")
        .update({ status: "closed" })
        .eq("pool_id", job?.pool_id);

      if (jobError) throw jobError;

      // Update pool status
      const { error: poolError } = await supabase
        .from("job_pools")
        .update({ is_active: false })
        .eq("id", job?.pool_id);

      if (poolError) throw poolError;

      setJob((prev) => (prev ? { ...prev, status: "closed" } : null));
      setShowCloseDialog(false);

      toast({
        title: "Success",
        description: "Job pool closed successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div className="p-8">Loading...</div>
      </EmployerLayout>
    );
  }

  if (!job) {
    return (
      <EmployerLayout>
        <div className="p-8">Job not found</div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout>
      <div className="p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {job.title}
            </h1>
            <div className="flex space-x-4">
              <Badge variant="outline">{job.status}</Badge>
              <Badge variant="outline">{job.publication_status}</Badge>
            </div>
          </div>
          <div className="space-x-4">
            {job.publication_status === "draft" && (
              <Button onClick={handlePublish}>Publish Job</Button>
            )}
            {job.status !== "closed" && (
              <Button
                variant="destructive"
                onClick={() => setShowCloseDialog(true)}
              >
                Close Pool
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <p className="whitespace-pre-wrap">{job.description}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Applications</h2>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Test Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No applications yet
                  </TableCell>
                </TableRow>
              ) : (
                applications
                  .sort(
                    (a, b) =>
                      (b.candidate.recent_marks || 0) -
                      (a.candidate.recent_marks || 0)
                  )
                  .map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">
                        {application.candidate.full_name}
                      </TableCell>
                      <TableCell>{application.candidate.email}</TableCell>
                      <TableCell>
                        {application.candidate.recent_marks
                          ? `${application.candidate.recent_marks}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge>{application.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Close Job Pool</AlertDialogTitle>
              <AlertDialogDescription>
                This will close all jobs in this pool and mark them as no longer
                accepting applications. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClosePool}>
                Close Pool
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </EmployerLayout>
  );
}
