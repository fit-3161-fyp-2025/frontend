import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface ProgressLoadingProps {
  message?: string;
  progress?: number;
  stages?: string[];
  currentStage?: number;
}

export function ProgressLoading({
  message = "Loading...",
  progress,
  stages = [],
  currentStage = 0,
}: ProgressLoadingProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (progress !== undefined) {
      setDisplayProgress(progress);
    } else if (stages.length > 0) {
      // Calculate progress based on current stage
      const calculatedProgress = ((currentStage + 1) / stages.length) * 100;
      setDisplayProgress(calculatedProgress);
    } else {
      // Animated indeterminate progress
      let interval: NodeJS.Timeout;
      let currentProgress = 0;
      const animate = () => {
        interval = setInterval(() => {
          currentProgress += Math.random() * 15;
          if (currentProgress > 85) {
            currentProgress = 85; // Stay at 85% for indeterminate
          }
          setDisplayProgress(currentProgress);
        }, 200);
      };
      animate();
      return () => clearInterval(interval);
    }
  }, [progress, stages.length, currentStage]);

  const currentStageMessage =
    stages.length > 0 && stages[currentStage] ? stages[currentStage] : message;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 sm:space-y-6 px-4">
      <div className="w-full max-w-md space-y-3 sm:space-y-4">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-medium">
            {currentStageMessage}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {stages.length > 0
              ? `Step ${currentStage + 1} of ${stages.length}`
              : "Please wait..."}
          </p>
        </div>

        <Progress value={displayProgress} className="w-full" />

        {progress !== undefined && (
          <p className="text-xs text-center text-muted-foreground">
            {Math.round(displayProgress)}% complete
          </p>
        )}
      </div>
    </div>
  );
}
