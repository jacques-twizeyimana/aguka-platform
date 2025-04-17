import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import AdminLayout from './Layout';
import { Users, Building2, BriefcaseIcon, HardHat as UserHardHat } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalRecruiters: number;
  totalJobSeekers: number;
  totalJobs: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRecruiters: 0,
    totalJobSeekers: 0,
    totalJobs: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const [
        { count: totalUsers },
        { count: totalRecruiters },
        { count: totalJobSeekers },
        { count: totalJobs },
      ] = await Promise.all([
        supabase
          .from('users')
          .select('*', { count: 'exact' }),
        supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('role', 'employer'),
        supabase
          .from('users')
          .select('*', { count: 'exact' })
          .eq('role', 'candidate'),
        supabase
          .from('jobs')
          .select('*', { count: 'exact' }),
      ]);

      setStats({
        totalUsers: totalUsers ?? 0,
        totalRecruiters: totalRecruiters ?? 0,
        totalJobSeekers: totalJobSeekers ?? 0,
        totalJobs: totalJobs ?? 0,
      });
    };

    fetchStats();
  }, [user]);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Recruiters
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalRecruiters}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <UserHardHat className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Job Seekers
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalJobSeekers}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <BriefcaseIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Jobs Posted
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalJobs}
                </h3>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}