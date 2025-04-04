import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import AdminLayout from './Layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserCheck } from 'lucide-react';

interface JobSeeker {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  profile: {
    age_group: string;
    career_summary: string;
  };
  work_experience: {
    role: string;
    company: string;
  }[];
  education: {
    level: string;
    school_name: string;
  }[];
  created_at: string;
}

export default function AdminJobSeekers() {
  const { user } = useAuth();
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState<string>('');
  const [experienceFilter, setExperienceFilter] = useState<string>('');
  const [showTalentsOnly, setShowTalentsOnly] = useState(false);

  useEffect(() => {
    const fetchJobSeekers = async () => {
      if (!user) return;

      try {
        let query = supabase
          .from('users')
          .select(`
            id,
            email,
            full_name,
            phone,
            created_at,
            candidate_profiles!inner (
              age_group,
              career_summary
            ),
            work_experience (
              role,
              company
            ),
            education (
              level,
              school_name
            )
          `)
          .eq('role', 'candidate');

        if (showTalentsOnly) {
          // Add a condition to filter verified talents
          // This is a placeholder - implement based on your talent verification logic
          query = query.eq('is_verified_talent', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        setJobSeekers(data || []);
      } catch (error) {
        console.error('Error fetching job seekers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobSeekers();
  }, [user, showTalentsOnly]);

  const filteredJobSeekers = jobSeekers.filter((seeker) => {
    const matchesSearch =
      !searchTerm ||
      seeker.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seeker.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAge = !ageFilter || seeker.profile?.age_group === ageFilter;

    const matchesExperience =
      !experienceFilter ||
      seeker.work_experience?.some((exp) =>
        exp.role.toLowerCase().includes(experienceFilter.toLowerCase())
      );

    return matchesSearch && matchesAge && matchesExperience;
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Seekers</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All age groups</SelectItem>
                <SelectItem value="20-25">20-25</SelectItem>
                <SelectItem value="26-30">26-30</SelectItem>
                <SelectItem value="31-35">31-35</SelectItem>
                <SelectItem value="36-40">36-40</SelectItem>
                <SelectItem value="41+">41+</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by experience"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
            />

            <Button
              variant={showTalentsOnly ? "default" : "outline"}
              onClick={() => setShowTalentsOnly(!showTalentsOnly)}
              className="flex items-center"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              {showTalentsOnly ? "Showing Talents" : "Show Talents Only"}
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredJobSeekers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No job seekers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobSeekers.map((seeker) => (
                  <TableRow key={seeker.id}>
                    <TableCell className="font-medium">
                      {seeker.full_name}
                    </TableCell>
                    <TableCell>{seeker.email}</TableCell>
                    <TableCell>{seeker.profile?.age_group}</TableCell>
                    <TableCell>
                      {seeker.work_experience?.[0]?.role} at{' '}
                      {seeker.work_experience?.[0]?.company}
                    </TableCell>
                    <TableCell>
                      {seeker.education?.[0]?.level} at{' '}
                      {seeker.education?.[0]?.school_name}
                    </TableCell>
                    <TableCell>
                      {new Date(seeker.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}