'use client';

export interface JourneyStep {
  instruction: string;
  distance: number;
  duration: number;
  location: [number, number];
}

interface Props {
  steps: JourneyStep[];
  activeStepIndex: number;
  remainingDistance: number | null;
  remainingDuration: number | null;
  distanceToNextTurn: number | null;
  arrived: boolean;
  onEnd: () => void;
}

function formatDistance(meters: number | null) {
  if (meters == null) return 'Waiting';
  if (meters < 1000) return `${Math.max(1, Math.round(meters))} m`;
  return `${(meters / 1000).toFixed(meters > 10000 ? 0 : 1)} km`;
}

function formatDuration(seconds: number | null) {
  if (seconds == null) return 'Waiting';
  const minutes = Math.max(1, Math.round(seconds / 60));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  if (!m) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export default function JourneyStepsSheet({
  steps,
  activeStepIndex,
  remainingDistance,
  remainingDuration,
  distanceToNextTurn,
  arrived,
  onEnd
}: Props) {
  const activeStep = steps[activeStepIndex];
  const nextInstruction = arrived
    ? 'You have arrived'
    : activeStep?.instruction ?? 'Start journey to load turn-by-turn directions';

  return (
    <details className="group absolute bottom-0 left-0 right-0 z-20 rounded-t-2xl bg-paper-light text-ink shadow-2xl open:max-h-[72vh]">
      <summary className="list-none cursor-pointer px-5 py-4">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/20" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-50">
              {arrived ? 'Arrival' : 'Next turn'}
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-tight">{nextInstruction}</h2>
            <p className="mt-2 text-sm opacity-70">
              {arrived ? 'End the journey when you are ready.' : `${formatDistance(distanceToNextTurn)} to next instruction`}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-lg font-semibold">{formatDuration(remainingDuration)}</p>
            <p className="text-xs uppercase tracking-wide opacity-55">{formatDistance(remainingDistance)} left</p>
          </div>
        </div>
      </summary>

      <div className="max-h-[48vh] overflow-auto border-t border-black/10 px-5 pb-5">
        {arrived ? (
          <div className="rounded-xl border border-pine/30 bg-pine/10 p-4">
            <p className="font-semibold text-pine">Arrived at your destination.</p>
            <p className="mt-1 text-sm opacity-75">Your live journey is complete inside Margasiri.</p>
            <button
              type="button"
              onClick={onEnd}
              className="mt-4 rounded-lg bg-indigo px-4 py-2 text-sm font-semibold text-paper-light"
            >
              End journey
            </button>
          </div>
        ) : (
          <ol className="divide-y divide-black/10">
            {steps.map((step, index) => (
              <li key={`${step.instruction}-${index}`} className={`py-3 ${index === activeStepIndex ? 'text-indigo' : ''}`}>
                <p className="text-sm font-semibold">{step.instruction}</p>
                <p className="mt-1 text-xs opacity-60">
                  {formatDistance(step.distance)} · {formatDuration(step.duration)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}
