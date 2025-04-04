import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Question {
  id: string;
  question: string;
  is_multiple_choice: boolean;
  options: string[];
}

export default function Test() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [testSessionId, setTestSessionId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    initializeTest();
    setupFullscreenListener();
    return () => {
      stopRecording();
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const setupFullscreenListener = () => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      submitTest();
    }
  };

  const initializeTest = async () => {
    try {
      // Start camera recording
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();

      // Get location
      const position = await new Promise((resolve: any) => {
        navigator.geolocation.getCurrentPosition(resolve);
      });

      // Create test session
      const { data: sessionData, error: sessionError } = await supabase
        .from("test_sessions")
        .insert({
          candidate_test_id: user?.id,
          is_practice: false,
          status: "in_progress",
          location_data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      setTestSessionId(sessionData.id);

      // Fetch questions
      const { data: questionData, error: questionError } = await supabase
        .from("test_questions")
        .select("*")
        .limit(30);

      if (questionError) throw questionError;
      setQuestions(questionData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initialize test. Please try again.",
      });
      navigate("/test-prep");
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (answer: string) => {
    if (!testSessionId) return;

    const currentQuestion = questions[currentQuestionIndex];

    try {
      const { error } = await supabase.from("test_responses").insert({
        test_session_id: testSessionId,
        question_id: currentQuestion.id,
        answer,
      });

      if (error) throw error;

      setAnswers({ ...answers, [currentQuestion.id]: answer });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save answer. Please try again.",
      });
    }
  };

  const stopRecording = async () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      const tracks = videoRef.current?.srcObject as MediaStream;
      tracks?.getTracks().forEach((track) => track.stop());
    }
  };

  const submitTest = async () => {
    if (!testSessionId) return;

    try {
      // Stop recording
      await stopRecording();

      // Create video blob and upload
      const videoBlob = new Blob(chunksRef.current, { type: "video/webm" });
      const { data: videoData, error: videoError } = await supabase.storage
        .from("test-recordings")
        .upload(`${testSessionId}.webm`, videoBlob);

      if (videoError) throw videoError;

      // Update test session
      const { error: updateError } = await supabase
        .from("test_sessions")
        .update({
          status: "completed",
          end_time: new Date().toISOString(),
          video_url: videoData.path,
        })
        .eq("id", testSessionId);

      if (updateError) throw updateError;

      navigate("/test-complete");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit test. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-32 h-24 fixed top-4 right-4 rounded-lg border border-gray-200"
          />
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                Time remaining: 1:30:00
              </span>
            </div>
            <progress
              className="w-full"
              value={currentQuestionIndex + 1}
              max={questions.length}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">
              {currentQuestion.question}
            </h2>

            {currentQuestion.is_multiple_choice ? (
              <RadioGroup
                value={answers[currentQuestion.id]}
                onValueChange={(value) => saveAnswer(value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => saveAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[200px]"
              />
            )}
          </div>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            >
              Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={submitTest}>Submit Test</Button>
            ) : (
              <Button
                onClick={() =>
                  setCurrentQuestionIndex(currentQuestionIndex + 1)
                }
              >
                Next
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
