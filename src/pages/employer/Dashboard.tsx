import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BriefcaseIcon,
  Users,
  UserCheck,
  PlusCircle,
} from 'lucide-react';

interface DashboardStats {
  totalJobs: number;
  totalApplications: number;
  totalHires: number;
}

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    totalApplications: 0,
    totalHires: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const [
        { count: jobsCount },
        { count: applicationsCount },
        { count: hiresCount },
      ] = await Promise.all([
        supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .eq('employer_id', user.id),
        supabase
          .from('applications')
          .select('*', { count: 'exact' })
          .eq('status', 'pending')
          .in(
            'job_id',
            supabase
              .from('jobs')
              .select('id')
              .eq('employer_id', user.id)
          ),
        supabase
          .from('applications')
          .select('*', { count: 'exact' })
          .eq('status', 'accepted')
          .in(
            'job_id',
            supabase
              .from('jobs')
              .select('id')
              .eq('employer_id', user.id)
          ),
      ]);

      setStats({
        totalJobs: jobsCount ?? 0,
        totalApplications: applicationsCount ?? 0,
        totalHires: hiresCount ?? 0,
      });
    };

    fetchStats();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <Link to="/employer/jobs/new">
            <Button className="bg-[#0A66C2]">
              <PlusCircle className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <BriefcaseIcon className="h-6 w-6 text-[#0A66C2]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalJobs}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalApplications}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <UserCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Successful Hires
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalHires}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Add job listings table here */}
      </div>
    </div>
  );
}