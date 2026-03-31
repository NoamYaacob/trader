import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { TopBar } from "@/components/layout/top-bar";
import { SessionResultsView } from "@/components/training/session-results";
import {
  getTrainingSession,
  getAttemptSummaries,
  buildSessionResults,
} from "@/features/training";
import { startTrainingSession } from "@/server/actions/training";

async function handleTrainAgain() {
  "use server";
  await startTrainingSession();
}

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function TrainingResultsPage({ params }: Props) {
  const authSession = await auth();
  if (!authSession?.user?.id) redirect("/sign-in");

  const { sessionId } = await params;
  const userId        = authSession.user.id;

  const trainingSession = await getTrainingSession(sessionId, userId);
  if (!trainingSession) notFound();

  // If the session is not complete yet, redirect to the active session.
  if (!trainingSession.completedAt) {
    redirect(`/training/${sessionId}`);
  }

  const attempts = await getAttemptSummaries(sessionId, userId);
  const results  = buildSessionResults(trainingSession, attempts);

  const scoreLabel = trainingSession.score !== null ? `${trainingSession.score}%` : undefined;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Session results" subtitle={scoreLabel} />
      <div className="flex-1 overflow-y-auto">
        <SessionResultsView results={results} trainAgainAction={handleTrainAgain} />
      </div>
    </div>
  );
}
