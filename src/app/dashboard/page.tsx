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
import { Label }
  from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { parseISO, getISOWeek, getYear, format, differenceInCalendarDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Brain, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { getTrainingAdvice } from '@/ai/flows/training-advice-flow';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const workoutFormSchema = z.object({
  date: z.date({ required_error: "Debe seleccionar una fecha." }),
  exerciseType: z.string().min(1, "Debe seleccionar un tipo de ejercicio."),
  weight: z.coerce.number().min(0, "El peso debe ser un número positivo.").optional(),
  repetitions: z.coerce.number().min(1, "Las repeticiones deben ser al menos 1.").optional(),
  series: z.coerce.number().min(1, "Las series deben ser al menos 1.").optional(),
});

type WorkoutFormData = z.infer<typeof workoutFormSchema>;

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
}

const exerciseOptions = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press", "Row", "Pull-ups",
  "Push-ups", "Lunges", "Bicep Curls", "Tricep Extensions", "Shoulder Press",
  "Lateral Raises", "Front Raises", "Leg Press", "Leg Extensions",
  "Hamstring Curls", "Calf Raises", "Crunches", "Plank", "Russian Twists",
  "Barbell Rows", "Dumbbell Rows", "Lat Pulldowns", "T-Bar Rows",
  "Seated Cable Rows", "Face Pulls", "Dips", "Close-Grip Bench Press",
  "Skullcrushers", "Hammer Curls", "Concentration Curls", "Preacher Curls"
];

const WorkoutForm: React.FC<{
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmitForm: (data: WorkoutFormData) => void;
}> = ({ isOpen, onOpenChange, onSubmitForm }) => {
  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      date: new Date(),
      exerciseType: "",
      weight: 0,
      repetitions: 0,
      series: 0,
    },
  });

  const handleFormSubmit = (data: WorkoutFormData) => {
    onSubmitForm(data);
    form.reset({ date: new Date(), exerciseType: "", weight: 0, repetitions: 0, series: 0 });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) form.reset({ date: new Date(), exerciseType: "", weight: 0, repetitions: 0, series: 0 }); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Ejercicio</DialogTitle>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {exerciseOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input type="number" placeholder="Ingresar Peso" {...field} />
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
                    <Input type="number" placeholder="Ingresar Repeticiones" {...field} />
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
                    <Input type="number" placeholder="Ingresar Series" {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4 text-right" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Añadir Ejercicio</Button>
              <DialogClose asChild>
                <Button variant="outline" type="button" onClick={() => { form.reset({ date: new Date(), exerciseType: "", weight: 0, repetitions: 0, series: 0 }); onOpenChange(false); }}>Cancelar</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const initialChartData = Array(7).fill(null).map((_, i) => ({ week: `W${i + 1}`, value: 0 }));

const weightChartConfig = {
  weight: { label: "Total Weight", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [workoutSummaryData, setWorkoutSummaryData] = useState<WorkoutEntry[]>([]);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(true);
  const [processedWeightData, setProcessedWeightData] = useState(initialChartData.map(d => ({ ...d, weight: d.value })));
  const [workoutCalendarDays, setWorkoutCalendarDays] = useState<Date[]>([]);
  const [totalLiftedWeightStat, setTotalLiftedWeightStat] = useState(0);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiAdviceLoading, setIsAiAdviceLoading] = useState(false);
  const [aiAdviceError, setAiAdviceError] = useState<string | null>(null);
  const [userAiQuery, setUserAiQuery] = useState("");
  const [showMotivationAlert, setShowMotivationAlert] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (user?.uid && db) {
        setIsLoadingWorkouts(true);
        try {
          const workoutsRef = collection(db, "workouts");
          const q = query(workoutsRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const workouts: WorkoutEntry[] = [];
          querySnapshot.forEach((doc) => {
            workouts.push({ id: doc.id, ...doc.data() } as WorkoutEntry);
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
  }, [user, toast]);

  useEffect(() => {
    if (!workoutSummaryData || workoutSummaryData.length === 0) {
      const emptyChartData = Array(7).fill(null).map((_, i) => ({ week: `W${i + 1}` }));
      setProcessedWeightData(emptyChartData.map(d => ({ ...d, weight: 0 })));
      setWorkoutCalendarDays([]);
      setTotalLiftedWeightStat(0);
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

    const weeklyData: Record<string, { weight: number }> = {};
    let overallTotalWeight = 0;

    const sortedWorkouts = [...workoutSummaryData].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

    const datesWithWorkoutsRaw: Date[] = [];

    sortedWorkouts.forEach(workout => {
      try {
        const date = parseISO(workout.date);
        datesWithWorkoutsRaw.push(date);

        const year = getYear(date);
        const weekNum = getISOWeek(date);
        const weekKey = `${year}-W${weekNum.toString().padStart(2, '0')}`;

        const weightLiftedInWorkout = (workout.weight || 0) * (workout.reps || 0) * (workout.sets || 0);
        overallTotalWeight += weightLiftedInWorkout;

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { weight: 0 };
        }
        weeklyData[weekKey].weight += weightLiftedInWorkout;
      } catch (e) {
        console.error("Error processing workout date:", workout.date, e);
      }
    });

    const uniqueDates = Array.from(new Set(datesWithWorkoutsRaw.map(date => date.setHours(0, 0, 0, 0)))).map(time => new Date(time));
    setWorkoutCalendarDays(uniqueDates);

    const sortedWeekKeys = Object.keys(weeklyData).sort();
    const recentWeekKeys = sortedWeekKeys.slice(-7);

    const newChartWeightData = recentWeekKeys.map((key, index) => ({
      week: `W${index + 1}`,
      weight: weeklyData[key].weight,
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
        paddedData.push(emptyEntry as T);
      }
      return paddedData.slice(0, count);
    };

    setProcessedWeightData(padChartData(newChartWeightData, 'weight', 7));
    setTotalLiftedWeightStat(overallTotalWeight);

  }, [workoutSummaryData]);

  const handleAddWorkoutSubmit = async (formData: WorkoutFormData) => {
    if (!user?.uid || !db) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes iniciar sesión para añadir un ejercicio.",
      });
      return;
    }

    const newWorkout: Omit<WorkoutEntry, 'id'> = {
      userId: user.uid,
      date: format(formData.date, "yyyy-MM-dd"),
      type: formData.exerciseType,
      duration: "45 min",
      sets: formData.series,
      reps: formData.repetitions,
      weight: formData.weight,
      createdAt: Timestamp.now(),
    };

    try {
      const docRef = await addDoc(collection(db, "workouts"), newWorkout);
      setWorkoutSummaryData(prevWorkouts => {
        const newWorkoutEntryWithId = { id: docRef.id, ...newWorkout, createdAt: newWorkout.createdAt };
        const updatedWorkouts = [newWorkoutEntryWithId, ...prevWorkouts];
        updatedWorkouts.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return 0;
        });
        return updatedWorkouts;
      });
      toast({
        title: "Ejercicio añadido",
        description: "Tu ejercicio ha sido guardado exitosamente.",
      });
      setIsWorkoutModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No se pudo guardar el ejercicio. Inténtalo de nuevo.",
      });
    }
  };

  const handleGetAiAdvice = async () => {
    if (!userProfile?.trainingGoal) {
      toast({
        variant: "destructive",
        title: "Objetivo no definido",
        description: "Por favor, define tu objetivo de entrenamiento en tu perfil para obtener consejos.",
      });
      return;
    }

    setIsAiAdviceLoading(true);
    setAiAdvice(null);
    setAiAdviceError(null);

    try {
      const result = await getTrainingAdvice({
        trainingGoal: userProfile.trainingGoal,
        currentRoutineDetails: userAiQuery,
      });
      setAiAdvice(result.advice);
    } catch (error: any) {
      setAiAdviceError(error.message || "No se pudo obtener el consejo de la IA.");
      toast({
        variant: "destructive",
        title: "Error de IA",
        description: error.message || "No se pudo obtener el consejo de la IA.",
      });
    } finally {
      setIsAiAdviceLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto w-full max-w-[960px] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-1">
            <h1 className="text-foreground tracking-tight text-3xl font-bold leading-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm font-normal leading-normal">Sigue tu trayectoria de entrenamiento y celebra tus logros.</p>
          </div>
        </div>

        {showMotivationAlert && (
          <Alert variant="default" className="bg-accent/10 border-accent text-accent-foreground">
            <Sparkles className="h-5 w-5 text-accent" />
            <AlertTitle className="font-semibold text-accent">¡Es Hora de Moverse!</AlertTitle>
            <AlertDescription>
              Hemos notado que no has registrado un entrenamiento en unos días. ¡Cada paso cuenta hacia tus metas! ¿Listo para tu próxima sesión?
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[200px] bg-card text-card-foreground p-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <h3 className="text-2xl font-bold tracking-tight text-card-foreground">
              Registra un nuevo entrenamiento
            </h3>
            <p className="text-sm text-card-foreground/80">
              Haz clic en el botón de abajo para añadir una nueva entrada de entrenamiento.
            </p>
            <Button className="mt-4" onClick={() => setIsWorkoutModalOpen(true)}>Añadir Ejercicio</Button>
          </div>
        </div>

        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl font-semibold">Asesor de Entrenamiento IA</CardTitle>
            </div>
            <CardDescription className="text-card-foreground/80 pt-1">
              Obtén consejos personalizados de nuestra IA para optimizar tu progresión de ejercicios según tu objetivo: <span className="font-semibold text-primary">{userProfile?.trainingGoal || "No definido"}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userAiQuery" className="text-sm font-medium text-card-foreground/90">
                Describe tu rutina actual o tus dudas (opcional):
              </Label>
              <Textarea
                id="userAiQuery"
                placeholder="Ej: Llevo 3 semanas estancado en press de banca, ¿qué puedo hacer?"
                value={userAiQuery}
                onChange={(e) => setUserAiQuery(e.target.value)}
                className="mt-1 bg-background/10 border-card-foreground/30 text-card-foreground placeholder:text-card-foreground/60 min-h-[80px]"
                disabled={isAiAdviceLoading || !userProfile?.trainingGoal}
              />
            </div>
            <Button
              onClick={handleGetAiAdvice}
              disabled={isAiAdviceLoading || !userProfile?.trainingGoal}
              className="w-full sm:w-auto"
            >
              {isAiAdviceLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Brain className="mr-2 h-4 w-4" />}
              {isAiAdviceLoading ? "Obteniendo consejo..." : "Obtener Consejo de IA"}
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

        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-0 pb-3 pt-5">Progreso de Levantamiento de Pesas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 px-0">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-base font-medium leading-normal">Peso Total Levantado</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-card-foreground tracking-tight text-3xl font-bold leading-tight truncate">{totalLiftedWeightStat.toLocaleString()} kg</p>
              <div className="flex gap-1 items-center">
                <p className="text-muted-foreground text-sm font-normal leading-normal">General</p>
              </div>
              <div className="h-[180px] w-full mt-4">
                <ChartContainer config={weightChartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedWeightData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillWeight" x1="0" y1="0" x2="0" y2="1">
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
                      <Area type="monotone" dataKey="weight" stroke="hsl(var(--primary))" fill="url(#fillWeight)" strokeWidth={2} dot={false} name="Weight Lifted" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
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

        <h2 className="text-foreground text-[22px] font-bold leading-tight tracking-[-0.015em] px-0 pb-3 pt-5">Resumen de Entrenamientos</h2>
        <div className="py-3 px-0">
          <Card className="overflow-hidden bg-card text-card-foreground">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-card">
                    <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-medium leading-normal">Fecha</TableHead>
                    <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-medium leading-normal">Tipo de Ejercicio</TableHead>
                    <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-medium leading-normal">Peso (kg)</TableHead>
                    <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-medium leading-normal">Series</TableHead>
                    <TableHead className="px-4 py-3 text-left text-card-foreground text-sm font-normal leading-normal">Repeticiones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingWorkouts ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Cargando ejercicios...
                      </TableCell>
                    </TableRow>
                  ) : workoutSummaryData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Aún no hay entrenamientos registrados. ¡Añade tu primer entrenamiento!
                      </TableCell>
                    </TableRow>
                  ) : (
                    workoutSummaryData.map((workout) => (
                      <TableRow key={workout.id} className="border-t border-border hover:bg-muted/20">
                        <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.date}</TableCell>
                        <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.type}</TableCell>
                        <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.weight !== undefined ? workout.weight : '-'}</TableCell>
                        <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.sets !== undefined ? workout.sets : '-'}</TableCell>
                        <TableCell className="h-[72px] px-4 py-2 text-muted-foreground text-sm font-normal leading-normal">{workout.reps !== undefined ? workout.reps : '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
      <WorkoutForm
        isOpen={isWorkoutModalOpen}
        onOpenChange={setIsWorkoutModalOpen}
        onSubmitForm={handleAddWorkoutSubmit}
      />
    </div>
  );
}
