"use client";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Area } from 'recharts';
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { parseISO, getISOWeek, getYear, format, differenceInCalendarDays } from 'date-fns';
import { es, gl } from 'date-fns/locale';
import { Calendar as CalendarIcon, Brain, Sparkles, Divide } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { getTrainingAdvice } from '@/ai/flows/training-advice-flow';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/layout/Header";
import { Highlighter } from "@/components/ui/highlighter";


const workoutFormSchema = z.object({
  date: z.date({ required_error: "Debe seleccionar una fecha." }),
  exerciseType: z.string().min(1, "Debe seleccionar un tipo de ejercicio."),
  weight: z.coerce.number().min(0, "El peso debe ser un número positivo.").optional(),
  repetitions: z.coerce.number().min(1, "Las repeticiones deben ser al menos 1.").optional(),
  series: z.coerce.number().min(1, "Las series deben ser al menos 1.").optional(),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;

const EXERCISE_METS: Record<string, number> = {
  brazos: 4.0,
  espalda: 4.5,
  pecho: 4.0,
  piernas: 5.0,
  hombros: 4.0,
  core: 3.5,
  glúteos: 5.0,
  cardio: 7.0,
  otros: 3.0,
};

const DEFAULT_USER_WEIGHT_KG = 70; 
const DEFAULT_DURATION_MINUTES = 45; 

const calculateCalories = (exerciseType: string, durationMinutes: number, userWeightKg: number): number => {
  const group = getMuscleGroup(exerciseType);
  const met = EXERCISE_METS[group] || EXERCISE_METS.otros;
  const weight = userWeightKg > 0 ? userWeightKg : DEFAULT_USER_WEIGHT_KG;

  const caloriesPerMinute = (met * weight * 3.5) / 200;
  const totalCalories = caloriesPerMinute * durationMinutes;

  return Math.round(totalCalories);
};

interface WorkoutEntry {
  id?: string;
  userId: string;
  date: string;
  type: string;
  duration: string;
  sets?: number;
  reps?: number;
  weight?: number;
  createdAt: Timestamp;
  caloriesBurned?: number;
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const muscleGroupcolors: Record<string, string> = {
  brazos: "text-blue-500",
  espalda: "text-green-500",
  pecho: "text-red-500",
  piernas: "text-yellow-500",
  hombros: "text-purple-500",
  core: "text-orange-500",
  cardio: "text-pink-500",
  glúteos: "text-teal-500",
  otros: "text-gray-500",
};

const getMuscleGroup = (exerciseType: string): string => {
  const ex = normalize(exerciseType);
  if (/biceps|curl|triceps|fondos|dominadas|martillo|extensión de tríceps|jalones/i.test(ex)) return "brazos";
  if (/espalda|remo|jalón|peso muerto|face pull|superman/i.test(ex)) return "espalda"; 
  if (/pecho|press de banca|pec deck|flexiones/i.test(ex)) return "pecho";
  if (/piernas|sentadillas|prensa de piernas|zancadas|extensiones de cuádriceps|curl de piernas/i.test(ex)) return "piernas";
  if (/hombros|press militar|elevaciones laterales|elevaciones frontales/i.test(ex)) return "hombros";
  if (/core|abdominal|plancha|russian twist|v-ups|hollow body/i.test(ex)) return "core";
  if (/cardio|escaladores|mountain climbers/i.test(ex)) return "cardio";
  if (/glúteos|hip thrust|puente de glúteos|glúteos en máquina/i.test(ex)) return "glúteos";
  return "otros";
};

const exerciseOptions = [
// ... (opciones de ejercicios sin cambios)
  "Abducción de cadera con banda elástica o cable",
  "Abducción y aducción de cadera con banda",
  "Ab wheel (rueda abdominal)",
  "Aductores en máquina (adductores)",
  "Buenos días con barra",
  "Crunch abdominal",
  "Curl de bíceps con banda",
  "Curl de bíceps con barra o mancuernas",
  "Curl de bíceps en máquina",
  "Curl de piernas sentado (femorales)",
  "Curl de piernas tumbado (femorales)",
  "Curl martillo con mancuernas",
  "Dominadas (pull-ups y chin-ups)",
  "Elevación de talones sentado (gemelos)",
  "Elevaciones de piernas colgado",
  "Elevaciones de talones de pie",
  "Elevaciones de talones (gemelos) con barra o mancuernas",
  "Elevaciones laterales con banda",
  "Elevaciones laterales con mancuernas",
  "Elevaciones laterales en máquina",
  "Elevaciones frontales con mancuernas",
  "Escaladores (mountain climbers)",
  "Extensión de tríceps con banda",
  "Extensión de tríceps con mancuerna o barra (French press)",
  "Extensión de tríceps en máquina",
  "Extensiones de cuádriceps",
  "Face pull (jalón para deltoides posteriores)",
  "Face pull con banda o polea",
  "Flexiones de brazos (push-ups)",
  "Fondos en paralelas (dips)",
  "Gemelos en máquina (elevación de talones sentado o de pie)",
  "Glúteos en máquina (patada de glúteo)",
  "Hip thrust con barra",
  "Hollow body hold",
  "Jalón al pecho con agarre estrecho",
  "Jalón al pecho con barra o polea",
  "Jalón al pecho (pulldown) en máquina",
  "Jalón con barra para trapecio (encogimiento de hombros)",
  "Jalones con banda elástica",
  "Pec deck (aperturas de pecho en máquina)",
  "Peso muerto (convencional)",
  "Peso muerto con barra o mancuernas",
  "Peso muerto con piernas rígidas (stiff-leg deadlift)",
  "Peso muerto rumano (RDL)",
  "Peso muerto sumo",
  "Pistol squats (sentadillas a una pierna)",
  "Plancha con toque de hombro",
  "Plancha frontal y lateral",
  "Press cerrado para tríceps",
  "Press de banca en máquina",
  "Press de banca inclinado con barra o mancuernas",
  "Press de hombros en máquina",
  "Press de hombros inclinado con barra o mancuernas",
  "Press de pecho en máquina",
  "Press militar con barra o mancuernas",
  "Press de tríceps con cuerda (máquina de polea)",
  "Prensa de piernas",
  "Puente de glúteos",
  "Puente de glúteos con barra o mancuerna",
  "Remo con banda elástica",
  "Remo con barra o mancuernas",
  "Remo inclinado con barra o mancuernas",
  "Remo sentado en máquina",
  "Russian twist",
  "Sentadillas con barra (back squat, front squat)",
  "Sentadillas con banda",
  "Sentadillas con salto (jump squats)",
  "Sentadillas libres",
  "Step ups con mancuernas",
  "Step-ups en banco o caja",
  "Superman (para espalda baja)",
  "V-ups",
  "Zancadas caminando",
  "Zancadas con mancuernas o barra"
];

const WorkoutForm: React.FC<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialData: WorkoutEntry | null;
 onSubmitForm: (data: WorkoutFormData, isEdit: boolean, workoutId?: string) => void;
}> = ({ isOpen, onOpenChange, initialData, onSubmitForm }) => {
  const isEditMode = !!initialData;
  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      date: initialData ? parseISO(initialData.date) : new Date(),
      exerciseType: initialData?.type || "",
      weight: initialData?.weight || 0,
      repetitions: initialData?.reps || 0,
      series: initialData?.sets || 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        date: initialData ? parseISO(initialData.date) : new Date(),
        exerciseType: initialData?.type || "",
        weight: initialData?.weight || 0,
        repetitions: initialData?.reps || 0,
        series: initialData?.sets || 0,
      });
    }
  }, [isOpen, initialData, form.reset]);


  const handleFormSubmit = (data: WorkoutFormData) => {
   onSubmitForm(data, isEditMode, initialData?.id);
    form.reset(); 
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) form.reset(); }}>
      <DialogContent className="sm:max-w-[425px] ">
        <DialogHeader>
           <DialogTitle>{isEditMode ? "Editar Ejercicio" : "Añadir Ejercicio"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right text-sm">Fecha</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl className="col-span-3">
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
          <FormField
  control={form.control}
  name="exerciseType"
  render={({ field }) => (
    <FormItem className="grid grid-cols-4 items-center gap-4">
      <FormLabel className="text-right text-sm">Tipo de Ejercicio</FormLabel>
      <FormControl className="col-span-3">
        <>
          <Input
            type="text"
            placeholder="Ingresar ejercicio"
            list="exerciseOptions"
            {...field}
          />
          <datalist id="exerciseOptions">
            {exerciseOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </>
      </FormControl>
      <FormMessage className="col-span-4 text-right" />
    </FormItem>
  )}
/>
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right text-sm">Peso (kg)</FormLabel>
                  <FormControl className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Ingresar Peso"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="repetitions"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right text-sm">Repeticiones</FormLabel>
                  <FormControl className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Ingresar Repeticiones"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur} 
                      className="text-primary"
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="series"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right text-sm">Series</FormLabel>
                  <FormControl className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Ingresar Series"
                      value={field.value === 0 ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {isEditMode ? "Guardar Cambios" : "Añadir Ejercicio"}
              </Button>
              <DialogClose asChild>
                <Button variant="outline" type="button" onClick={() => { form.reset(); onOpenChange(false); }}>Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const initialChartData = Array(7).fill(null).map((_, i) => ({ week: `W${i + 1}`, value: 0 }));

const caloriesChartConfig = {
  calories: { label: "Total Calorías", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutSummaryData, setWorkoutSummaryData] = useState<WorkoutEntry[]>([]);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);
  const [processedCaloriesData, setProcessedCaloriesData] = useState(initialChartData.map(d => ({ ...d, calories: d.value })));
  const [workoutCalendarDays, setWorkoutCalendarDays] = useState<Date[]>([]);
  const [totalCaloriesBurnedStat, setTotalCaloriesBurnedStat] = useState(0);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiAdviceLoading, setIsAiAdviceLoading] = useState(false);
  const [aiAdviceError, setAiAdviceError] = useState<string | null>(null);
  const [userAiQuery, setUserAiQuery] = useState("");
  const [showMotivationAlert, setShowMotivationAlert] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null);
  const bgImage = userProfile?.gender === "Femenino"
    ? "/photo/bg-female.png"
    : userProfile?.gender === "Masculino"
      ? "/photo/bg-male.png"
      : "/photo/bg-default.jpg";


  useEffect(() => {
    // ... (fetchWorkouts sin cambios relevantes a la edición)
    const fetchWorkouts = async () => {
      if (user?.uid && db) {
        setIsLoadingWorkouts(true);
        try {
          const workoutsRef = collection(db, "workouts");
          const q = query(workoutsRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const workouts: WorkoutEntry[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            let durationMinutes: number = DEFAULT_DURATION_MINUTES; 

            if (data.duration) {
              const numericMatch = data.duration.match(/(\d+)/);
              if (numericMatch && numericMatch[1]) {
                durationMinutes = parseInt(numericMatch[1], 10) || DEFAULT_DURATION_MINUTES;
              }
            }
            
            const weightKg = userProfile?.weight || DEFAULT_USER_WEIGHT_KG;
            const caloriesBurned = data.caloriesBurned || calculateCalories(data.type, durationMinutes, weightKg);

            workouts.push({ id: doc.id, ...data, caloriesBurned } as WorkoutEntry);
          });
          workouts.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
            return 0;
          });
          setWorkoutSummaryData(workouts);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error al cargar ejercicios",
            description: "No se pudieron cargar los ejercicios guardados.",
          });
          setWorkoutSummaryData([]);
        } finally {
          setIsLoadingWorkouts(false);
        }
      } else {
        setWorkoutSummaryData([]);
        setIsLoadingWorkouts(false);
      }
    };

    fetchWorkouts();
  }, [user, toast, userProfile?.weight]); 

  useEffect(() => {
    if (!workoutSummaryData || workoutSummaryData.length === 0) {
      const emptyChartData = Array(7).fill(null).map((_, i) => ({ week: `W${i + 1}` }));
      setProcessedCaloriesData(emptyChartData.map(d => ({ ...d, calories: 0, value: 0 })));
      setWorkoutCalendarDays([]);
      setTotalCaloriesBurnedStat(0);
      setShowMotivationAlert(false);
      return;
    }

    const mostRecentWorkoutDateStr = workoutSummaryData[0]?.date;
    if (mostRecentWorkoutDateStr) {
      try {
        const mostRecentDate = parseISO(mostRecentWorkoutDateStr);
        const today = new Date();
        const daysSinceLastWorkout = differenceInCalendarDays(today, mostRecentDate);
        if (daysSinceLastWorkout >= 3) {
          setShowMotivationAlert(true);
        } else {
          setShowMotivationAlert(false);
        }
      } catch (e) {
        setShowMotivationAlert(false);
      }
    } else {
      setShowMotivationAlert(false);
    }

    const weeklyData: Record<string, { calories: number }> = {};
    let overallTotalCalories = 0;

    const sortedWorkouts = [...workoutSummaryData].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    const datesWithWorkoutsRaw: Date[] = [];

    sortedWorkouts.forEach(workout => {
      try {
        const date = parseISO(workout.date);
        datesWithWorkoutsRaw.push(date);

        const year = getYear(date);
        const weekNum = getISOWeek(date);
        const weekKey = `${year}-W${weekNum.toString().padStart(2, '0')}`;

        const caloriesBurnedInWorkout = workout.caloriesBurned || 0;
        overallTotalCalories += caloriesBurnedInWorkout;

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { calories: 0 };
        }
        weeklyData[weekKey].calories += caloriesBurnedInWorkout;
      } catch (e) {
        console.error("Error processing workout date:", workout.date, e);
      }
    });

    const uniqueDates = Array.from(new Set(datesWithWorkoutsRaw.map(date => date.setHours(0, 0, 0, 0)))).map(time => new Date(time));
    setWorkoutCalendarDays(uniqueDates);

    const sortedWeekKeys = Object.keys(weeklyData).sort();
    const recentWeekKeys = sortedWeekKeys.slice(-7);

    const newChartCaloriesData = recentWeekKeys.map((key, index) => ({
      week: `W${index + 1}`,
      calories: weeklyData[key].calories,
      value: weeklyData[key].calories,
    }));

    const padChartData = <T extends { week: string }>(data: T[], dataKey: keyof T, count: number): T[] => {
      const paddedData = [...data];
      let currentMaxWeek = 0;
      if (paddedData.length > 0) {
        const lastWeekNumStr = paddedData[paddedData.length - 1].week.substring(1);
        currentMaxWeek = parseInt(lastWeekNumStr) || 0;
      }

      while (paddedData.length < count) {
        currentMaxWeek++;
        const emptyEntry: any = { week: `W${currentMaxWeek}` };
        emptyEntry[dataKey] = 0;
        emptyEntry['value'] = 0;
        paddedData.push(emptyEntry as T);
      }
      return paddedData.slice(0, count);
    };

    setProcessedCaloriesData(padChartData(newChartCaloriesData, 'calories', 7));
    setTotalCaloriesBurnedStat(overallTotalCalories);

  }, [workoutSummaryData, userProfile?.weight]);

  const handleEditWorkout = (workout: WorkoutEntry) => {
    setEditingWorkout(workout);
    setIsWorkoutModalOpen(true);
  };
  
  // AÑADIDO: Función para limpiar el estado de edición al cerrar el modal
  const handleCloseWorkoutModal = (open: boolean) => {
    setIsWorkoutModalOpen(open);
    if (!open) {
      setEditingWorkout(null);
    }
  };


  const handleWorkoutSubmit = async (formData: WorkoutFormData, isEdit: boolean, workoutId?: string) => {
    if (!user?.uid || !db) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para guardar un ejercicio.",
      });
      return;
    }

    const durationMinutes = DEFAULT_DURATION_MINUTES; 
    const userWeightKg = userProfile?.weight || DEFAULT_USER_WEIGHT_KG;
    const calculatedCalories = calculateCalories(formData.exerciseType, durationMinutes, userWeightKg);

    const workoutData = {
      userId: user.uid,
      date: format(formData.date, "yyyy-MM-dd"),
      type: formData.exerciseType,
      duration: "45 min", 
      sets: formData.series,
      reps: formData.repetitions,
      weight: formData.weight,
     caloriesBurned: calculatedCalories,
    };

    try {
      if (isEdit && workoutId) {
         const workoutRef = doc(db, "workouts", workoutId);
       await updateDoc(workoutRef, workoutData);
        
       setWorkoutSummaryData(prevWorkouts => {
          return prevWorkouts.map(w => 
            w.id === workoutId ? { ...w, ...workoutData, id: workoutId, createdAt: w.createdAt } : w
          );
        });
        
        toast({
          title: "Ejercicio actualizado",
          description: "Los cambios han sido guardados exitosamente.",
        });
      } else {
        const newWorkout = { ...workoutData, createdAt: Timestamp.now() };
        const docRef = await addDoc(collection(db, "workouts"), newWorkout);
        
        setWorkoutSummaryData(prevWorkouts => {
          const newWorkoutEntryWithId = { id: docRef.id, ...newWorkout, createdAt: newWorkout.createdAt, caloriesBurned: calculatedCalories };
          const updatedWorkouts = [newWorkoutEntryWithId, ...prevWorkouts];
          updatedWorkouts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
          return updatedWorkouts;
        });
        
        toast({
          title: "Ejercicio añadido",
          description: "Tu ejercicio ha sido guardado exitosamente.",
        });
      }
      
      handleCloseWorkoutModal(false); 
    } catch (error) {
      console.error("Error al guardar/actualizar el ejercicio:", error);
      toast({
        variant: "destructive",
        title: `Error al ${isEdit ? 'actualizar' : 'guardar'}`,
        description: `No se pudo ${isEdit ? 'actualizar' : 'guardar'} el ejercicio. Inténtalo de nuevo.`,
      });
    }
  };


  const handleGetAiAdvice = async () => {
    if (!userProfile?.trainingGoal) {
      setAiAdviceError("Por favor define tu objetivo de entrenamiento primero.");
      return;
    }

    setIsAiAdviceLoading(true);
    setAiAdviceError(null);
    setAiAdvice(null);

    try {
      const advice = await getTrainingAdvice({
        trainingGoal: userProfile.trainingGoal,
        currentRoutineDetails: userAiQuery
      });
      setAiAdvice(advice.advice);
    } catch (error) {
      console.error("Error fetching AI advice:", error);
      setAiAdviceError(
        "No pudimos obtener el consejo en este momento. Intenta más tarde."
      );
    } finally {
      setIsAiAdviceLoading(false);
    }
  };
  return (


    <div className="flex flex-1 flex-col bg-black bg-center bg-cover transition-all duration-300"
      style={{ backgroundImage: `url(${bgImage})` }}>
      <div className=''>
        <Header />
      </div>
      <div className="flex flex-1 items-center justify-center bg-[#023257]/30 backdrop-blur-lg shadow-lg min-h-[200px] text-card-foreground p-6">

        <div className="mx-auto w-full max-w-[960px] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <div className="flex min-w-72 flex-col gap-1">
              <h1 className=" text-white tracking-tight text-5xl font-bold leading-tight">
                ¡Qué bien tenerte de vuelta, {" "}
                <Highlighter action="highlight" color="#023257">
                  {userProfile?.displayName || "Atleta"}!
                </Highlighter>{" "}🎉


              </h1>
              <p className="text-white text-sm font-normal leading-normal">Sigue tu trayectoria de entrenamiento y celebra tus logros.</p>
            </div>
          </div>

          {showMotivationAlert && (
            <Alert variant="default" className=" bg-[#023257]/30 backdrop-blur-lg border-accent text-white">
              <Sparkles className="h-5 w-5 text-accent" />
              <AlertTitle className="font-semibold text-accent">¡Es Hora de Moverse!</AlertTitle>
              <AlertDescription>
                Hemos notado que no has registrado un entrenamiento en unos días.
                {" "}
                <Highlighter action="underline" color="#FF9800">
                  ¡Cada paso cuenta hacia tus metas!
                </Highlighter> {" "}
                ¿Listo para tu próxima sesión?
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-1 items-center justify-center bg-[#023257]/30 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg min-h-[200px] text-card-foreground p-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <h3 className="text-2xl font-bold tracking-tight text-card-foreground">
                Registra un nuevo entrenamiento
              </h3>
              <p className="text-sm text-card-foreground/80">
                Haz clic en el botón de abajo para añadir una nueva entrada de entrenamiento.
              </p>
             <Button className="mt-4" onClick={() => { setEditingWorkout(null); setIsWorkoutModalOpen(true); }}>
                <Highlighter action="underline" color="#FF9800">
                  Añadir Ejercicio
                </Highlighter>
              </Button>
            </div>
          </div>

          <Card className="rounded-xl border border-white/20 bg-[#023257]/30 backdrop-blur-lg
         backdrop-blur-lg text-card-foreground">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <CardTitle className="text-xl font-semibold">Asesor de Entrenamiento IA</CardTitle>
              </div>
              <CardDescription className="text-card-foreground/80 pt-1">
                Obtén consejos personalizados de nuestra IA para optimizar tu progresión de ejercicios según tu objetivo:
                <Highlighter action="box" color="#00f7ffff">
                  <span className="font-semibold text-white">{userProfile?.trainingGoal || "No definido"}</span>.
                </Highlighter>{" "}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userAiQuery" className="text-sm font-medium  text-card-foreground/90">
                  Describe tu rutina actual o tus dudas (opcional):
                </Label>
                <Textarea
                  id="userAiQuery"
                  placeholder="Ej: Llevo 3 semanas estancado en press de banca, ¿qué puedo hacer?"
                  value={userAiQuery}
                  onChange={(e) => setUserAiQuery(e.target.value)}
                  className="mt-1 bg-[#023257]/10 backdrop-blur-lg border-card-foreground/30 text-card-foreground placeholder:text-card-foreground/60 min-h-[80px]"
                  disabled={isAiAdviceLoading || !userProfile?.trainingGoal}
                />
              </div>


              <Button
                onClick={handleGetAiAdvice}
                disabled={isAiAdviceLoading || !userProfile?.trainingGoal}
                className="w-full sm:w-auto"
              >
                {isAiAdviceLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Brain className="mr-2 h-4 w-4" />}
                <Highlighter action="highlight" color="#3b7aadff">
                  {isAiAdviceLoading ? "Obteniendo consejo..." : "Obtener Consejo de IA"}
                </Highlighter>{" "}
              </Button>

              {isAiAdviceLoading && (
                <div className="flex items-center justify-center p-4 rounded-md bg-muted/30">
                  <LoadingSpinner />
                  <p className="ml-3 text-sm text-card-foreground/80">Consultando a nuestro experto IA...</p>
                </div>
              )}

              {aiAdviceError && (
                <div className="p-3 rounded-md bg-destructive/20 border border-destructive text-destructive">
                  <p className="text-sm font-medium">Error:</p>
                  <p className="text-sm">{aiAdviceError}</p>
                </div>
              )}

              {aiAdvice && !isAiAdviceLoading && (
                <div className="p-4 rounded-md bg-primary/10 border border-primary mt-4">
                  <h4 className="text-md font-semibold text-primary mb-2">Consejo de la IA:</h4>
                  <p className="text-sm text-card-foreground/90 whitespace-pre-wrap">{aiAdvice}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-0 pb-3 pt-5">Progreso de Calorías Quemadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 px-0">
            <Card className="rounded-xl border border-white/20 bg-[#023257]/30 backdrop-blur-lg text-card-foreground">
              <CardHeader>
                <CardTitle className="text-base font-medium leading-normal">Total Calorías Quemadas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-card-foreground tracking-tight text-3xl font-bold leading-tight truncate">{totalCaloriesBurnedStat.toLocaleString()} kcal</p>
                <div className="flex gap-1 items-center">
                  <p className="text-muted-foreground text-sm font-normal leading-normal">General</p>
                </div>
                <div className="h-[180px] w-full mt-4">
                  <ChartContainer config={caloriesChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={processedCaloriesData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="fillCalories" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : ''} style={{ fontSize: '0.75rem', fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: '0.75rem', fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            color: "hsl(var(--card-foreground))"
                          }}
                          labelStyle={{ fontWeight: "bold" }}
                        />
                        <Area type="monotone" dataKey="calories" stroke="hsl(var(--primary))" fill="url(#fillCalories)" strokeWidth={2} dot={false} name="Calories Burned" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-white/20 bg-[#023257]/30 backdrop-blur-lg text-card-foreground">
              <CardHeader>
                <CardTitle className="text-base font-medium leading-normal">Calendario de Actividad</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <Calendar
                  mode="multiple"
                  selected={workoutCalendarDays}
                  modifiersClassNames={{
                    selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90',
                  }}
                  className="rounded-md border"
                  weekStartsOn={1}
                  locale={es}
                />
              </CardContent>
            </Card>
          </div>

          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-0 pb-3 pt-5">Resumen de Entrenamientos</h2>
          <div className="py-3 px-0">
            <Card className="overflow-hidden rounded-xl border border-white/20 bg-[#023257]/30 backdrop-blur-lg text-card-foreground">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-card">
                      <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-medium leading-normal">Fecha</TableHead>
                      <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-medium leading-normal">Tipo de Ejercicio</TableHead>
                      <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-medium leading-normal">Peso (kg)</TableHead>
                      <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-medium leading-normal">Series</TableHead>
                      <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-normal leading-normal">Repeticiones</TableHead>
                      <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-normal leading-normal">Calorías (kcal)</TableHead>
                     <TableHead className="px-4 py-3 text-right text-card-foreground text-sm font-normal leading-normal">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingWorkouts ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Cargando ejercicios...
                        </TableCell>
                      </TableRow>
                    ) : workoutSummaryData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Aún no hay entrenamientos registrados. ¡Añade tu primer entrenamiento!
                        </TableCell>
                      </TableRow>
                    ) : (
                      workoutSummaryData.map((workout) => {
                        const group = getMuscleGroup(workout.type || "");
                        const colorClass = muscleGroupcolors[group] || muscleGroupcolors["otros"];
                        return (
                          <TableRow key={workout.id} className="border-t border-border hover:bg-muted/20">
                            <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.date}</TableCell>
                            <TableCell className={`h-[72px] px-4 py-2 text-sm`}>
                              <span className={cn("inline-flex items-center gap-2 px-2 py-1 rounded-md font-medium", colorClass)}>
                                {workout.type}
                              </span>
                            </TableCell>
                            <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.weight !== undefined ? workout.weight : '-'}</TableCell>
                            <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.sets !== undefined ? workout.sets : '-'}</TableCell>
                            <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.reps !== undefined ? workout.reps : '-'}</TableCell>
                            <TableCell className="h-[72px] px-4 py-2 text-primary text-sm font-bold leading-normal">{workout.caloriesBurned !== undefined ? workout.caloriesBurned.toLocaleString() : '-'}</TableCell>
                            <TableCell className="h-[72px] px-4 py-2 text-right">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => workout.id && handleEditWorkout(workout)}
                                    className="text-white hover:bg-primary/50"
                                >
                                    Editar
                                </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <WorkoutForm
        isOpen={isWorkoutModalOpen}
        onOpenChange={handleCloseWorkoutModal}
       onSubmitForm={handleWorkoutSubmit}
        initialData={editingWorkout} 
      />
    </div>
  );
}