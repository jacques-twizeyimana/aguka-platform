import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Aguka!
        </h1>
        <p className="text-gray-600 mb-8">
          Your employer account has been successfully created. You can now start posting jobs and finding the best talent for your company.
        </p>
        <Button
          onClick={() => navigate('/dashboard')}
          className="bg-[#0A66C2] w-full"
        >
          Start Hiring
        </Button>
      </div>
    </div>
  );
}