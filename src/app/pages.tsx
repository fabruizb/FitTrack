
import { ArrowRight } from 'lucide-react';
import { ShinyButton } from '@/components/magicui/shiny-button';
import { Ripple } from "@/components/magicui/ripple";
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { VideoText } from '@/components/magicui/video-text';
import { BoxReveal } from '@/components/magicui/box-reveal';

export default function HomePage() {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem-1px)] overflow-hidden">
            <div className="z-10 container mx-auto flex flex-col items-center justify-center p-4 text-center">
                <div className="relative h-28 w-full max-w-4xl mb-6">
                    <VideoText src="https://cdn.magicui.design/ocean-small.webm">
                        Bienvenido a FitTrack
                    </VideoText>
                </div>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
                    Una app que te permite registrar y hacer seguimiento de tus entrenamientos y ejercicios diarios.
                </p>
                <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
                    <ShinyButton href="/signup">
                        Registro <ArrowRight className="h-5 w-5" />
                    </ShinyButton>
                    <ShimmerButton href="/login" background="hsl(var(--secondary))">
                        Al lio
                    </ShimmerButton>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
                    <div className="p-6 rounded-lg bg-card text-card-foreground shadow-md flex flex-col items-start text-left">
                        <BoxReveal boxColor={"hsl(var(--primary))"} duration={0.5}>
                            <h3 className="text-xl font-semibold mb-2">Facil de usar</h3>
                        </BoxReveal>
                        <BoxReveal boxColor={"hsl(var(--secondary))"} duration={0.5}>
                            <p className="text-sm text-card-foreground/80 mt-1">
                                Tan sencillo como recordar que ejercicios hiciste la cantidad de peso que levantaste y cuantas veces sufriste.
                            </p>
                        </BoxReveal>
                    </div>
                    <div className="p-6 rounded-lg bg-card text-card-foreground shadow-md flex flex-col items-start text-left">
                        <BoxReveal boxColor={"hsl(var(--primary))"} duration={0.5}>
                            <h3 className="text-xl font-semibold mb-2">¿Te falta motivacion?</h3>
                        </BoxReveal>
                        <BoxReveal boxColor={"hsl(var(--secondary))"} duration={0.5}>
                            <p className="text-sm text-card-foreground/80 mt-1">
                                FitTrack te enseña que dias faltaste a entrenar y te envia alertas para que no decaigas.
                            </p>
                        </BoxReveal>
                    </div>
                    <div className="p-6 rounded-lg bg-card text-card-foreground shadow-md flex flex-col items-start text-left">
                        <BoxReveal boxColor={"hsl(var(--primary))"} duration={0.5}>
                            <h3 className="text-xl font-semibold mb-2">¿No sabes como seguir?</h3>
                        </BoxReveal>
                        <BoxReveal boxColor={"hsl(var(--secondary))"} duration={0.5}>
                            <p className="text-sm text-card-foreground/80 mt-1">
                                FitTrack te ayuda con IA a realizar la progresion ideal de tus ejercicios para que consigas tus objetivos de manera optima.
                            </p>
                        </BoxReveal>
                    </div>
                </div>
            </div>
            <Ripple />
        </div>
    );
}
