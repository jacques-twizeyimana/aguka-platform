import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
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
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  description: string;
  specializations: Specialization[];
}

interface Specialization {
  id: string;
  name: string;
  description: string;
}

interface TestQuestion {
  id: string;
  chapter: string;
  seniority: string;
  question: string;
  is_multiple_choice: boolean;
  options: string[];
  correct_answer: string;
  marks: number;
}

const seniorities = ["junior", "mid", "senior", "expert"];

export default function AdminCategories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<Specialization | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newSpecialization, setNewSpecialization] = useState({
    name: "",
    description: "",
  });
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
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
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("job_categories")
        .select(
          `
          id,
          name,
          description,
          job_specializations (
            id,
            name,
            description
          )
        `
        )
        .order("name");

      if (error) throw error;

      setCategories(
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
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (specializationId: string) => {
    try {
      const { data, error } = await supabase
        .from("test_questions")
        .select("*")
        .eq("specialization_id", specializationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleAddCategory = async () => {
    try {
      const { data, error } = await supabase
        .from("job_categories")
        .insert({
          name: newCategory.name,
          description: newCategory.description,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, { ...data, specializations: [] }]);
      setNewCategory({ name: "", description: "" });

      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleAddSpecialization = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from("job_specializations")
        .insert({
          category_id: categoryId,
          name: newSpecialization.name,
          description: newSpecialization.description,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(
        categories.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                specializations: [...category.specializations, data],
              }
            : category
        )
      );
      setNewSpecialization({ name: "", description: "" });

      toast({
        title: "Success",
        description: "Specialization added successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleAddQuestion = async () => {
    if (!selectedSpecialization) return;

    try {
      const { data, error } = await supabase
        .from("test_questions")
        .insert({
          specialization_id: selectedSpecialization.id,
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

  const handleViewQuestions = (specialization: Specialization) => {
    setSelectedSpecialization(specialization);
    setShowQuestions(true);
    fetchQuestions(specialization.id);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {!showQuestions ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Categories & Specializations
              </h1>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Category Name"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Description"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button onClick={handleAddCategory} className="w-full">
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {category.name}
                        </h2>
                        <p className="mt-1 text-gray-600">
                          {category.description}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Specialization
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Specialization</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Input
                                placeholder="Specialization Name"
                                value={newSpecialization.name}
                                onChange={(e) =>
                                  setNewSpecialization({
                                    ...newSpecialization,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Description"
                                value={newSpecialization.description}
                                onChange={(e) =>
                                  setNewSpecialization({
                                    ...newSpecialization,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <Button
                              onClick={() =>
                                handleAddSpecialization(category.id)
                              }
                              className="w-full"
                            >
                              Add Specialization
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="mt-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Specialization</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-48">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.specializations.map((spec) => (
                            <TableRow key={spec.id}>
                              <TableCell className="font-medium">
                                {spec.name}
                              </TableCell>
                              <TableCell>{spec.description}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleViewQuestions(spec)}
                                  >
                                    <BookOpen className="h-4 w-4" />
                                  </Button>
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
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setShowQuestions(false)}
                  className="mb-4"
                >
                  ← Back to Categories
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">
                  Test Questions for {selectedSpecialization?.name}
                </h1>
              </div>
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapter</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
