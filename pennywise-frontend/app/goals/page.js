// "use client";

// import { useState, useEffect } from "react";
// import DashboardLayout from "@/components/layout/DashboardLayout";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Progress } from "@/components/ui/progress";
// import { Badge } from "@/components/ui/badge";
// import {
//   Target,
//   Plus,
//   Edit,
//   Trash2,
//   Calendar,
//   DollarSign,
//   TrendingUp,
// } from "lucide-react";
// // import { mockGoals as initialGoals } from '@/data/mockData'; // Remove mock
// import { toast } from "sonner";
// import { useAuth } from "@/contexts/AuthContext";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// export default function GoalsPage() {
//   const { token } = useAuth();
//   const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
//   const [goals, setGoals] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editingGoal, setEditingGoal] = useState(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     title: "",
//     targetAmount: "",
//     currentAmount: "", // Default to empty, backend might default to 0 if not provided
//     deadline: "",
//     category: "",
//   });

//   useEffect(() => {
//     if (!token) return;
//     const fetchGoals = async () => {
//       setIsLoading(true);
//       try {
//         const response = await fetch(`${API_URL}/goals`, {
//           headers: authHeaders,
//         });
//         if (!response.ok) throw new Error("Failed to fetch goals");
//         const data = await response.json();
//         setGoals(data);
//       } catch (error) {
//         toast.error(`Error fetching goals: ${error.message}`);
//         console.error("Fetch goals error:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchGoals();
//   }, [token]);

//   const handleAddGoal = async () => {
//     if (
//       !formData.title ||
//       !formData.targetAmount ||
//       !formData.deadline ||
//       !formData.category
//     ) {
//       toast.error("Please fill in all fields");
//       return;
//     }
//     const goalData = {
//       ...formData,
//       targetAmount: parseFloat(formData.targetAmount),
//       currentAmount: parseFloat(formData.currentAmount) || 0, // Default to 0 if empty
//     };

//     try {
//       const response = await fetch(
//         `${API_URL}/goals`,
//         { headers: authHeaders },
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json", ...authHeaders },
//           body: JSON.stringify(goalData),
//         }
//       );
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to add goal");
//       }
//       const newGoal = await response.json();
//       setGoals([...goals, newGoal]);
//       setFormData({
//         title: "",
//         targetAmount: "",
//         currentAmount: "",
//         deadline: "",
//         category: "",
//       });
//       setIsAddModalOpen(false);
//       toast.success("Goal added successfully");
//     } catch (error) {
//       toast.error(`Error: ${error.message}`);
//       console.error("Add goal error:", error);
//     }
//   };

//   const handleEditGoal = async () => {
//     if (
//       !formData.title ||
//       !formData.targetAmount ||
//       !formData.deadline ||
//       !formData.category ||
//       !editingGoal
//     ) {
//       toast.error("Please fill in all fields or select a goal to edit.");
//       return;
//     }
//     const goalData = {
//       ...formData,
//       targetAmount: parseFloat(formData.targetAmount),
//       currentAmount: parseFloat(formData.currentAmount) || 0,
//     };

//     try {
//       const response = await fetch(`${API_URL}/goals/${editingGoal.id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", ...authHeaders },
//         body: JSON.stringify(goalData),
//       });
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Failed to update goal");
//       }
//       const updatedGoal = await response.json();
//       setGoals(goals.map((g) => (g.id === editingGoal.id ? updatedGoal : g)));
//       setIsEditModalOpen(false);
//       setEditingGoal(null);
//       toast.success("Goal updated successfully");
//     } catch (error) {
//       toast.error(`Error: ${error.message}`);
//       console.error("Update goal error:", error);
//     }
//   };

//   const handleDeleteGoal = async (id) => {
//     try {
//       const response = await fetch(`${API_URL}/goals/${id}`, {
//         method: "DELETE",
//         headers: authHeaders,
//       });
//       if (!response.ok) {
//         let errorMessage = `Failed to delete goal. Status: ${response.status}`;
//         try {
//           const errorData = await response.json();
//           errorMessage = errorData.message || errorMessage;
//         } catch (e) {
//           /* Ignore */
//         }
//         throw new Error(errorMessage);
//       }
//       setGoals(goals.filter((g) => g.id !== id));
//       toast.success("Goal deleted successfully");
//     } catch (error) {
//       toast.error(`Error: ${error.message}`);
//       console.error("Delete goal error:", error);
//     }
//   };

//   const openEditModal = (goal) => {
//     setEditingGoal(goal);
//     setFormData({
//       title: goal.title,
//       targetAmount: goal.targetAmount.toString(),
//       currentAmount: goal.currentAmount.toString(),
//       deadline: goal.deadline,
//       category: goal.category,
//     });
//     setIsEditModalOpen(true);
//   };

//   const getProgressPercentage = (current, target) => {
//     return Math.min((current / target) * 100, 100);
//   };

//   const getDaysRemaining = (deadline) => {
//     const today = new Date();
//     const deadlineDate = new Date(deadline);
//     const diffTime = deadlineDate - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   if (isLoading) {
//     return (
//       <DashboardLayout>
//         <div className="flex justify-center items-center h-screen">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-6 animate-fade-in">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <div>
//             <h1 className="text-3xl font-bold text-white mb-2">
//               Financial Goals
//             </h1>
//             <p className="text-gray-400">
//               Set and track your financial objectives
//             </p>
//           </div>

//           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//             <DialogTrigger asChild>
//               <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 glow-effect">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Goal
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="glass-morphism border-gray-700">
//               <DialogHeader>
//                 <DialogTitle className="text-white">Add New Goal</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="title" className="text-gray-300">
//                     Goal Title
//                   </Label>
//                   <Input
//                     id="title"
//                     placeholder="e.g., Emergency Fund"
//                     value={formData.title}
//                     onChange={(e) =>
//                       setFormData({ ...formData, title: e.target.value })
//                     }
//                     className="bg-gray-800 border-gray-600 text-white"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="category" className="text-gray-300">
//                     Category
//                   </Label>
//                   <Input
//                     id="category"
//                     placeholder="e.g., Savings, Travel, Technology"
//                     value={formData.category}
//                     onChange={(e) =>
//                       setFormData({ ...formData, category: e.target.value })
//                     }
//                     className="bg-gray-800 border-gray-600 text-white"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="targetAmount" className="text-gray-300">
//                     Target Amount
//                   </Label>
//                   <Input
//                     id="targetAmount"
//                     type="number"
//                     step="0.01"
//                     placeholder="0.00"
//                     value={formData.targetAmount}
//                     onChange={(e) =>
//                       setFormData({ ...formData, targetAmount: e.target.value })
//                     }
//                     className="bg-gray-800 border-gray-600 text-white"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="currentAmount" className="text-gray-300">
//                     Current Amount
//                   </Label>
//                   <Input
//                     id="currentAmount"
//                     type="number"
//                     step="0.01"
//                     placeholder="0.00"
//                     value={formData.currentAmount}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         currentAmount: e.target.value,
//                       })
//                     }
//                     className="bg-gray-800 border-gray-600 text-white"
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="deadline" className="text-gray-300">
//                     Deadline
//                   </Label>
//                   <Input
//                     id="deadline"
//                     type="date"
//                     value={formData.deadline}
//                     onChange={(e) =>
//                       setFormData({ ...formData, deadline: e.target.value })
//                     }
//                     className="bg-gray-800 border-gray-600 text-white"
//                   />
//                 </div>

//                 <Button
//                   onClick={handleAddGoal}
//                   className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
//                 >
//                   Add Goal
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Goals Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {goals.map((goal) => {
//             const progressPercentage = getProgressPercentage(
//               goal.currentAmount,
//               goal.targetAmount
//             );
//             const daysRemaining = getDaysRemaining(goal.deadline);
//             const isOverdue = daysRemaining < 0;

//             return (
//               <Card
//                 key={goal.id}
//                 className="glass-morphism border-gray-700 hover:glow-effect transition-all duration-300"
//               >
//                 <CardHeader className="pb-4">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <CardTitle className="text-white text-lg mb-2">
//                         {goal.title}
//                       </CardTitle>
//                       <Badge
//                         variant="secondary"
//                         className="bg-gray-700 text-gray-300"
//                       >
//                         {goal.category}
//                       </Badge>
//                     </div>
//                     <div className="flex space-x-2">
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => openEditModal(goal)}
//                         className="text-gray-400 hover:text-white hover:bg-gray-700"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </Button>
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         onClick={() => handleDeleteGoal(goal.id)}
//                         className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   {/* Progress */}
//                   <div>
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-gray-300 text-sm">Progress</span>
//                       <span className="text-green-400 font-semibold">
//                         {progressPercentage.toFixed(1)}%
//                       </span>
//                     </div>
//                     <Progress
//                       value={progressPercentage}
//                       className="h-2 bg-gray-700"
//                     />
//                   </div>

//                   {/* Amount */}
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="text-gray-400 text-sm">Current</p>
//                       <p className="text-white font-semibold">
//                         ${(goal.currentAmount ?? 0).toLocaleString()}
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-gray-400 text-sm">Target</p>
//                       <p className="text-white font-semibold">
//                         ${(goal.targetAmount ?? 0).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Deadline */}
//                   <div className="flex items-center justify-between pt-2 border-t border-gray-700">
//                     <div className="flex items-center space-x-2">
//                       <Calendar className="w-4 h-4 text-gray-400" />
//                       <span className="text-gray-400 text-sm">
//                         {new Date(goal.deadline).toLocaleDateString()}
//                       </span>
//                     </div>
//                     <span
//                       className={`text-sm font-medium ${
//                         isOverdue
//                           ? "text-red-400"
//                           : daysRemaining <= 30
//                           ? "text-yellow-400"
//                           : "text-green-400"
//                       }`}
//                     >
//                       {isOverdue ? "Overdue" : `${daysRemaining} days left`}
//                     </span>
//                   </div>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>

//         {/* Empty State */}
//         {goals.length === 0 && (
//           <Card className="glass-morphism border-gray-700">
//             <CardContent className="text-center py-16">
//               <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-white mb-2">
//                 No Goals Yet
//               </h3>
//               <p className="text-gray-400 mb-6">
//                 Set your first financial goal to start tracking your progress
//               </p>
//               <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//                 <DialogTrigger asChild>
//                   <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
//                     <Plus className="w-4 h-4 mr-2" />
//                     Add Your First Goal
//                   </Button>
//                 </DialogTrigger>
//               </Dialog>
//             </CardContent>
//           </Card>
//         )}

//         {/* Edit Modal */}
//         <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
//           <DialogContent className="glass-morphism border-gray-700">
//             <DialogHeader>
//               <DialogTitle className="text-white">Edit Goal</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="edit-title" className="text-gray-300">
//                   Goal Title
//                 </Label>
//                 <Input
//                   id="edit-title"
//                   placeholder="e.g., Emergency Fund"
//                   value={formData.title}
//                   onChange={(e) =>
//                     setFormData({ ...formData, title: e.target.value })
//                   }
//                   className="bg-gray-800 border-gray-600 text-white"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="edit-category" className="text-gray-300">
//                   Category
//                 </Label>
//                 <Input
//                   id="edit-category"
//                   placeholder="e.g., Savings, Travel, Technology"
//                   value={formData.category}
//                   onChange={(e) =>
//                     setFormData({ ...formData, category: e.target.value })
//                   }
//                   className="bg-gray-800 border-gray-600 text-white"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="edit-targetAmount" className="text-gray-300">
//                   Target Amount
//                 </Label>
//                 <Input
//                   id="edit-targetAmount"
//                   type="number"
//                   step="0.01"
//                   placeholder="0.00"
//                   value={formData.targetAmount}
//                   onChange={(e) =>
//                     setFormData({ ...formData, targetAmount: e.target.value })
//                   }
//                   className="bg-gray-800 border-gray-600 text-white"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="edit-currentAmount" className="text-gray-300">
//                   Current Amount
//                 </Label>
//                 <Input
//                   id="edit-currentAmount"
//                   type="number"
//                   step="0.01"
//                   placeholder="0.00"
//                   value={formData.currentAmount}
//                   onChange={(e) =>
//                     setFormData({ ...formData, currentAmount: e.target.value })
//                   }
//                   className="bg-gray-800 border-gray-600 text-white"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="edit-deadline" className="text-gray-300">
//                   Deadline
//                 </Label>
//                 <Input
//                   id="edit-deadline"
//                   type="date"
//                   value={formData.deadline}
//                   onChange={(e) =>
//                     setFormData({ ...formData, deadline: e.target.value })
//                   }
//                   className="bg-gray-800 border-gray-600 text-white"
//                 />
//               </div>

//               <Button
//                 onClick={handleEditGoal}
//                 className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
//               >
//                 Update Goal
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   );
// }

// /////////////////////////////////////////////////

"use client";

import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid"; // ✅ new
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export default function GoalsPage() {
  const { token } = useAuth();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  /* ---------- form state ---------- */
  const [formData, setFormData] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    category: "",
  });

  /* ---------- fetch goals on mount / token change ---------- */
  useEffect(() => {
    if (!token) return;

    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/goals`, { headers: authHeaders });
        if (!res.ok) throw new Error("Failed to fetch goals");
        const data = await res.json();
        setGoals(data);
      } catch (err) {
        toast.error(`Error fetching goals: ${err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [token]);

  /* ---------- add goal ---------- */
  const handleAddGoal = async () => {
    if (
      !formData.title ||
      !formData.targetAmount ||
      !formData.deadline ||
      !formData.category
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const goalPayload = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
    };

    /* optimistic temp goal so every item always has a unique key */
    const tempGoal = { ...goalPayload, id: uuid(), isPending: true };
    setGoals((prev) => [...prev, tempGoal]);

    try {
      /* ✅ correct single-options-object POST */
      const res = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(goalPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add goal");
      }

      const createdGoal = await res.json();

      /* ✅ guard for array-vs-object and replace temp item */
      setGoals((prev) => {
        /* remove the optimistic tempGoal first */
        const withoutTemp = prev.filter((g) => g.id !== tempGoal.id);

        if (Array.isArray(createdGoal)) {
          return [...withoutTemp, ...createdGoal];
        }
        return [...withoutTemp, createdGoal];
      });

      toast.success("Goal added successfully");
      setFormData({
        title: "",
        targetAmount: "",
        currentAmount: "",
        deadline: "",
        category: "",
      });
      setIsAddModalOpen(false);
    } catch (err) {
      /* rollback optimistic goal */
      setGoals((prev) => prev.filter((g) => g.id !== tempGoal.id));
      toast.error(`Error: ${err.message}`);
      console.error(err);
    }
  };

  /* ---------- edit goal ---------- */
  const handleEditGoal = async () => {
    if (
      !formData.title ||
      !formData.targetAmount ||
      !formData.deadline ||
      !formData.category ||
      !editingGoal
    ) {
      toast.error("Please fill in all fields or select a goal to edit.");
      return;
    }

    const goalPayload = {
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
    };

    try {
      const res = await fetch(`${API_URL}/goals/${editingGoal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(goalPayload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update goal");
      }

      const updatedGoal = await res.json();
      setGoals((prev) =>
        prev.map((g) => (g.id === editingGoal.id ? updatedGoal : g))
      );

      toast.success("Goal updated successfully");
      setIsEditModalOpen(false);
      setEditingGoal(null);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
      console.error(err);
    }
  };

  /* ---------- delete goal ---------- */
  const handleDeleteGoal = async (id) => {
    const previous = goals;
    setGoals((prev) => prev.filter((g) => g.id !== id)); // optimistic

    try {
      const res = await fetch(`${API_URL}/goals/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete goal (${res.status})`
        );
      }

      toast.success("Goal deleted successfully");
    } catch (err) {
      /* rollback optimistic removal */
      setGoals(previous);
      toast.error(`Error: ${err.message}`);
      console.error(err);
    }
  };

  /* ---------- helpers ---------- */
  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      category: goal.category,
    });
    setIsEditModalOpen(true);
  };

  const getProgressPercentage = (current, target) =>
    Math.min((current / target) * 100, 100);

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const due = new Date(deadline);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  /* ---------- loading state ---------- */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500" />
        </div>
      </DashboardLayout>
    );
  }

  /* ---------- render ---------- */
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Financial Goals
            </h1>
            <p className="text-gray-400">
              Set and track your financial objectives
            </p>
          </div>

          {/* add-goal button & modal */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 glow-effect">
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>

            <DialogContent className="glass-morphism border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Goal</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* title */}
                <div>
                  <Label htmlFor="title" className="text-gray-300">
                    Goal Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Emergency Fund"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                {/* category */}
                <div>
                  <Label htmlFor="category" className="text-gray-300">
                    Category
                  </Label>
                  <Input
                    id="category"
                    placeholder="e.g., Savings, Travel, Technology"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                {/* target amount */}
                <div>
                  <Label htmlFor="targetAmount" className="text-gray-300">
                    Target Amount
                  </Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                {/* current amount */}
                <div>
                  <Label htmlFor="currentAmount" className="text-gray-300">
                    Current Amount
                  </Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.currentAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentAmount: e.target.value,
                      })
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                {/* deadline */}
                <div>
                  <Label htmlFor="deadline" className="text-gray-300">
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <Button
                  onClick={handleAddGoal}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* goals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = getProgressPercentage(
              goal.currentAmount,
              goal.targetAmount
            );
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isOverdue = daysRemaining < 0;

            return (
              <Card
                key={goal.id}
                className="glass-morphism border-gray-700 hover:glow-effect transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg mb-2">
                        {goal.title}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-gray-700 text-gray-300"
                      >
                        {goal.category}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(goal)}
                        className="text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">Progress</span>
                      <span className="text-green-400 font-semibold">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-gray-700" />
                  </div>

                  {/* amounts */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-400 text-sm">Current</p>
                      <p className="text-white font-semibold">
                        ${goal.currentAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Target</p>
                      <p className="text-white font-semibold">
                        ${goal.targetAmount?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* deadline */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">
                        {new Date(goal.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isOverdue
                          ? "text-red-400"
                          : daysRemaining <= 30
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {isOverdue ? "Overdue" : `${daysRemaining} days left`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* empty state */}
        {goals.length === 0 && (
          <Card className="glass-morphism border-gray-700">
            <CardContent className="text-center py-16">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Goals Yet
              </h3>
              <p className="text-gray-400 mb-6">
                Set your first financial goal to start tracking your progress
              </p>

              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Goal
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* edit modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="glass-morphism border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Goal</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* edit fields (same as add) */}
              <div>
                <Label htmlFor="edit-title" className="text-gray-300">
                  Goal Title
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="edit-category" className="text-gray-300">
                  Category
                </Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="edit-targetAmount" className="text-gray-300">
                  Target Amount
                </Label>
                <Input
                  id="edit-targetAmount"
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAmount: e.target.value })
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="edit-currentAmount" className="text-gray-300">
                  Current Amount
                </Label>
                <Input
                  id="edit-currentAmount"
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, currentAmount: e.target.value })
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="edit-deadline" className="text-gray-300">
                  Deadline
                </Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <Button
                onClick={handleEditGoal}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Update Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
