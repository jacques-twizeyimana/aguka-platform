import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Camera, Wifi, Mic, MonitorCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestInfo {
  specialization: string;
  seniority: string;
  lastTestDate: string | null;
  nextAvailableDate: string | null;
}

export default function TestPrep() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testInfo, setTestInfo] = useState<TestInfo | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [deviceChecks, setDeviceChecks] = useState({
    camera: false,
    microphone: false,
    fullscreen: false,
    location: false,
  });

  useEffect(() => {
    fetchTestInfo();
  }, []);

  const fetchTestInfo = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("candidate_tests")
      .select(
        `
        specialization:job_specializations(name),
        seniority,
        last_test_date,
        next_available_date
      `
      )
      .eq("candidate_id", user.id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch test information",
      });
      return;
    }

    if (data) {
      setTestInfo({
        specialization: data.specialization.name,
        seniority: data.seniority,
        lastTestDate: data.last_test_date,
        nextAvailableDate: data.next_available_date,
      });
    }
  };

  const checkDevices = async () => {
    try {
      // Check camera
      const camera = await navigator.mediaDevices.getUserMedia({ video: true });
      camera.getTracks().forEach((track) => track.stop());
      setDeviceChecks((prev) => ({ ...prev, camera: true }));

      // Check microphone
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      mic.getTracks().forEach((track) => track.stop());
      setDeviceChecks((prev) => ({ ...prev, microphone: true }));

      // Check location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setDeviceChecks((prev) => ({ ...prev, location: true }));

      // Request fullscreen
      const elem = document.documentElement;
      await elem.requestFullscreen();
      setDeviceChecks((prev) => ({ ...prev, fullscreen: true }));

      // If all checks pass, navigate to test
      if (Object.values(deviceChecks).every((check) => check)) {
        navigate("/test");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Device Check Failed",
        description: "Please ensure all permissions are granted and try again",
      });
    }
  };

  const startPracticeTest = () => {
    navigate("/practice-test");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Test Preparation</h1>

          {testInfo && (
            <div className="mb-8">
              <p className="text-lg mb-2">
                Specialization:{" "}
                <span className="font-semibold">{testInfo.specialization}</span>
              </p>
              <p className="text-lg mb-4">
                Level:{" "}
                <span className="font-semibold">{testInfo.seniority}</span>
              </p>
              {testInfo.lastTestDate && (
                <p className="text-sm text-gray-600">
                  Last test taken:{" "}
                  {new Date(testInfo.lastTestDate).toLocaleDateString()}
                </p>
              )}
              {testInfo.nextAvailableDate && (
                <p className="text-sm text-red-600">
                  Next test available:{" "}
                  {new Date(testInfo.nextAvailableDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Practice Test</h2>
              <p className="mb-4">
                Take a practice test to familiarize yourself with the format:
                <ul className="list-disc list-inside mt-2">
                  <li>10 questions in 30 minutes</li>
                  <li>Mix of multiple choice and open-ended questions</li>
                  <li>Practice as many times as you want</li>
                </ul>
              </p>
              <Button onClick={startPracticeTest}>Start Practice Test</Button>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                Official Test Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Camera className="h-6 w-6 text-gray-600" />
                  <span>Working camera required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mic className="h-6 w-6 text-gray-600" />
                  <span>Working microphone required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Wifi className="h-6 w-6 text-gray-600" />
                  <span>Stable internet connection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MonitorCheck className="h-6 w-6 text-gray-600" />
                  <span>Full screen mode required</span>
                </div>
              </div>
              <Button
                onClick={() => setShowWarning(true)}
                className="w-full"
                variant="destructive"
              >
                Start Official Test
              </Button>
            </div>
          </div>
        </Card>

        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Important Test Information</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p className="font-semibold text-red-600">
                  Please read carefully before proceeding:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>This test can only be taken once every 6 months</li>
                  <li>You must keep your camera on during the entire test</li>
                  <li>A stable internet connection is required</li>
                  <li>
                    The test will be automatically submitted if you exit
                    full-screen mode
                  </li>
                  <li>You will have 1.5 hours to complete 30 questions</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={checkDevices}>
                Proceed with Test
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
