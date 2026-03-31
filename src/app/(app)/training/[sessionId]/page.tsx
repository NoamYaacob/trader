import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { TrainingSessionView } from "@/components/training/training-session";
import {
  getTrainingSession,
  getExamplesForTraining,
  getSessionAttempts,
} from "@/features/training";
import { getLatestPlaybook } from "@/features/playbook/data/playbook";
import { getChecklistRules } from "@/features/playbook";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function TrainingSessionPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const { sessionId } = await params;
  const userId        = session.user.id;

  const trainingSession = await getTrainingSession(sessionId, userId);
  if (!trainingSession) notFound();

  // Already completed — redirect to results.
  if (trainingSession.completedAt) {
    redirect(`/training/${sessionId}/results`);
  }

  const [examples, attemptsMap, playbook] = await Promise.all([
    getExamplesForTraining(trainingSession.exampleOrder, userId),
    getSessionAttempts(sessionId),
    getLatestPlaybook(trainingSession.playbookId, userId),
  ]);

  const checklistRules = playbook ? getChecklistRules(playbook.rules) : [];

  // Convert Map to plain object for client serialization.
  const initialAttempts = Object.fromEntries(attemptsMap);

  return (
    <TrainingSessionView
      sessionId={sessionId}
      examples={examples}
      initialAttempts={initialAttempts}
      checklistRules={checklistRules}
    />
  );
}
