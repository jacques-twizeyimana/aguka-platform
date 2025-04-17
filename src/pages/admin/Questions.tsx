import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  specializations: Specialization[];
}

interface Specialization {
  id: string;
  name: string;
  category_name: string;
}

interface Question {
  id: string;
  specialization_id: string;
  chapter: string;
  seniority: string;
  question: string;
  is_multiple_choice: boolean;
  options: string[];
  correct_answer: string;
  marks: number;
  job_specializations: {
    name: string;
    job_categories: {
      name: string;
    };
  };
}

const seniorities = ["junior", "mid", "senior", "expert"];

export default function AdminQuestions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");
  const [newQuestion, setNewQuestion] = useState({
    chapter: "",
    seniority: "junior",
    question: "",
    is_multiple_choice: false,
    options: [""],
    correct_answer: "",
    marks: 1,
  });

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
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
        // @ts-ignore
        data.map((category) => ({
          ...category,
          specializations: category.job_specializations,
        }))
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const fetchQuestions = async () => {
    try {
      let query = supabase
        .from("test_questions")
        .select(
          `
          *,
          job_specializations!inner (
            id,
            name,
            job_categories!inner (
              name
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (selectedSpecialization) {
        query = query.eq("specialization_id", selectedSpecialization);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQuestions(data || []);
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

  const handleAddQuestion = async () => {
    if (!selectedSpecialization) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a specialization",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("test_questions")
        .insert({
          specialization_id: selectedSpecialization,
          ...newQuestion,
          options: newQuestion.is_multiple_choice ? newQuestion.options : [],
        })
        .select()
        .single();

      if (error) throw error;

      setQuestions([data, ...questions]);
      setNewQuestion({
        chapter: "",
        seniority: "junior",
        question: "",
        is_multiple_choice: false,
        options: [""],
        correct_answer: "",
        marks: 1,
      });

      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Questions</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Specialization</Label>
                    <Select
                      value={selectedSpecialization}
                      onValueChange={setSelectedSpecialization}
                      disabled={!selectedCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
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
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Chapter</Label>
                    <Input
                      placeholder="e.g., HTML, CSS, JavaScript"
                      value={newQuestion.chapter}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          chapter: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seniority Level</Label>
                    <Select
                      value={newQuestion.seniority}
                      onValueChange={(value) =>
                        setNewQuestion({
                          ...newQuestion,
                          seniority: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {seniorities.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea
                    placeholder="Enter your question here"
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        question: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newQuestion.is_multiple_choice}
                    onCheckedChange={(checked) =>
                      setNewQuestion({
                        ...newQuestion,
                        is_multiple_choice: checked,
                      })
                    }
                  />
                  <Label>Multiple Choice Question</Label>
                </div>

                {newQuestion.is_multiple_choice && (
                  <div className="space-y-4">
                    <Label>Options</Label>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              options: newOptions,
                            });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        {index === newQuestion.options.length - 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              setNewQuestion({
                                ...newQuestion,
                                options: [...newQuestion.options, ""],
                              })
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() =>
                              setNewQuestion({
                                ...newQuestion,
                                options: newQuestion.options.filter(
                                  (_, i) => i !== index
                                ),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  {newQuestion.is_multiple_choice ? (
                    <Select
                      value={newQuestion.correct_answer}
                      onValueChange={(value) =>
                        setNewQuestion({
                          ...newQuestion,
                          correct_answer: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        {newQuestion.options.map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Textarea
                      placeholder="Enter the correct answer"
                      value={newQuestion.correct_answer}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          correct_answer: e.target.value,
                        })
                      }
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newQuestion.marks}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        marks: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <Button onClick={handleAddQuestion} className="w-full">
                  Add Question
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedSpecialization}
              onValueChange={setSelectedSpecialization}
              disabled={!selectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Specializations</SelectItem>
                {categories
                  .find((c) => c.id === selectedCategory)
                  ?.specializations.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Chapter</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No questions found
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell>
                      {question.job_specializations.job_categories.name}
                    </TableCell>
                    <TableCell>{question.job_specializations.name}</TableCell>
                    <TableCell>{question.chapter}</TableCell>
                    <TableCell>
                      {question.seniority.charAt(0).toUpperCase() +
                        question.seniority.slice(1)}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">{question.question}</div>
                    </TableCell>
                    <TableCell>
                      {question.is_multiple_choice
                        ? "Multiple Choice"
                        : "Open Answer"}
                    </TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
