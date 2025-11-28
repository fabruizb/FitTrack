"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import GlassButton from "@/components/magicui/GlassButton";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import Plasma from '@/components/magicui/PlasmaBg';
import { Highlighter } from "@/components/ui/highlighter";
import GlassSurface from "@/components/magicui/GlassSurface";

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  return (
    <div className="relative bg-black/60 flex flex-col items-center justify-center min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 -z-10">
  <Plasma 
    color="#022D4E"
    speed={0.6}
    direction="forward"
    scale={1.1}
    opacity={0.8}
    mouseInteractive={true}
  />

      <div className="absolute inset-0 bg-gray-700 mix-blend-overlay" />
</div>
      
      <div className="relative z-10 container mx-auto flex flex-col items-center justify-center p-4 text-center">
        <div className="relative h-28 w-full max-w-4xl mb-6">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">
            FitTrack
          </h1>
        </div>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
          Una app que te permite {" "}
          <Highlighter action="underline" color="#058FF8">
          registrar
        </Highlighter>{" "}
           y hacer 
           {" "}
          <Highlighter action="highlight" color="#058FF8">
          seguimiento
        </Highlighter>{" "}
        de tus entrenamientos y ejercicios diarios.
        </p>


        <div className="space-y-6 sm:space-y-0 sm:space-x-8 flex flex-col sm:flex-row">
         
          <GlassButton onClick={() => setIsSignupOpen(true)}>
            Registro <ArrowRight className="h-5 w-5" />
          </GlassButton>

          <GlassButton onClick={() => setIsLoginOpen(true)}>
            Al lío <ArrowRight className="h-5 w-5" />
          </GlassButton>
        </div>

        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-8xl">
  
  <div className="p-6 rounded-xl bg-[#023257]/50 backdrop-blur-lg border border-[#058FF8]/20 shadow-lg flex flex-col items-start text-left space-y-4">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-[#058FF8]/10 rounded-full">
        <span className="material-icons text-[#058FF8] text-4xl">
          touch_app
        </span>
      </div>
      <h3 className="text-3xl font-semibold text-white">Fácil de usar</h3>
    </div>
    <p className="text-xl text-white/80 mt-1">
      Tan sencillo como recordar qué ejercicios hiciste, la cantidad de peso
      que levantaste y cuántas veces sufriste.
    </p>
  </div>

  <div className="p-6 rounded-xl bg-[#023257]/30 backdrop-blur-lg border border-[#058FF8]/20 shadow-lg flex flex-col items-start text-left space-y-4">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-[#058FF8]/10 rounded-full">
        <span className="material-icons text-[#058FF8] text-4xl">
          notifications_active
        </span>
      </div>
      <h3 className="text-3xl font-semibold text-white">
        ¿Te falta motivación?
      </h3>
    </div>
    <p className="text-xl text-white/80 mt-1">
      FitTrack te enseña qué días faltaste a entrenar y te envía alertas para
      que no decaigas.
    </p>
  </div>


  <div className="p-6 rounded-xl bg-[#023257]/20 backdrop-blur-lg border border-[#058FF8]/20 shadow-lg flex flex-col items-start text-left space-y-4">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-[#058FF8]/10 rounded-full">
        <span className="material-icons text-[#058FF8] text-4xl">
          auto_awesome
        </span>
      </div>
      <h3 className="text-3xl font-semibold text-white">
        ¿No sabes cómo seguir?
      </h3>
    </div>
    <p className="text-xl text-white/80 mt-1">
      FitTrack te ayuda con IA a realizar la progresión ideal de tus ejercicios
      para que consigas tus objetivos de manera óptima.
    </p>
  </div>
</div>

      </div>

      <AnimatePresence>
        {isLoginOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
            />

            <motion.div
              className="fixed top-0 right-0 h-full w-full sm:w-[420px]  bg-[#023257]/30 backdrop-blur-lg z-50 shadow-2xl p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
             

              <LoginForm />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSignupOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSignupOpen(false)}
            />

            <motion.div
              className="fixed top-0 left-0 h-full w-full sm:w-[600px]  bg-[#023257]/30 backdrop-blur-lg z-50 shadow-2xl p-6 overflow-y-auto"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              

              <SignupForm />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    
  );
}
