import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, userCareerScores } from "@/lib/db/schema";
import { desc, eq, isNotNull } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Medal } from "lucide-react";

export const metadata = {
  title: "Leaderboard - Outvestments",
  description: "See how you rank against other traders",
};

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  predictionScore: number;
  performanceScore: number;
  totalPnl: number;
  letterGrade: string;
  isCurrentUser: boolean;
}

function getGradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-green-500";
  if (grade.startsWith("B")) return "text-blue-500";
  if (grade.startsWith("C")) return "text-yellow-500";
  if (grade.startsWith("D")) return "text-orange-500";
  return "text-red-500";
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="w-5 h-5 text-center text-sm font-bold">{rank}</span>;
}

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user?.dbId) {
    redirect("/login");
  }

  // Fetch all users with career scores, ordered by prediction score
  const leaderboardData = await db
    .select({
      id: users.id,
      name: users.name,
      predictionQualityScore: userCareerScores.predictionQualityScore,
      performanceScore: userCareerScores.performanceScore,
      totalPnlDollars: userCareerScores.totalPnlDollars,
      predictionGrade: userCareerScores.predictionGrade,
    })
    .from(users)
    .leftJoin(userCareerScores, eq(users.id, userCareerScores.userId))
    .where(isNotNull(userCareerScores.predictionQualityScore))
    .orderBy(desc(userCareerScores.predictionQualityScore))
    .limit(50);

  const leaderboard: LeaderboardEntry[] = leaderboardData.map((entry, index) => ({
    rank: index + 1,
    userId: entry.id,
    userName: entry.name || "Anonymous Trader",
    predictionScore: Number(entry.predictionQualityScore) || 0,
    performanceScore: Number(entry.performanceScore) || 0,
    totalPnl: Number(entry.totalPnlDollars) || 0,
    letterGrade: entry.predictionGrade || "C",
    isCurrentUser: entry.id === session.user.dbId,
  }));

  const currentUserRank = leaderboard.find((e) => e.isCurrentUser)?.rank;

  return (
    <div className="container max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how your trading performance ranks against others.
          </p>
        </div>
        {currentUserRank && (
          <Badge variant="outline" className="text-lg px-4 py-2">
            Your Rank: #{currentUserRank}
          </Badge>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Rankings Yet</h3>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              Complete some trades and close positions to appear on the
              leaderboard. Your scores are calculated when you close aims and
              shots.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Traders
            </CardTitle>
            <CardDescription>
              Ranked by Prediction Quality Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Trader</div>
                <div className="col-span-2 text-right">Prediction</div>
                <div className="col-span-2 text-right">Performance</div>
                <div className="col-span-2 text-right">P&L</div>
                <div className="col-span-1 text-center">Grade</div>
              </div>

              {/* Leaderboard Rows */}
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg items-center ${
                    entry.isCurrentUser
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="col-span-1 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="col-span-4 font-medium flex items-center gap-2">
                    {entry.userName}
                    {entry.isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-1">
                    <Target className="w-3 h-3 text-muted-foreground" />
                    {entry.predictionScore.toFixed(1)}
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end gap-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    {entry.performanceScore.toFixed(1)}
                  </div>
                  <div
                    className={`col-span-2 text-right font-mono ${
                      entry.totalPnl >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {entry.totalPnl >= 0 ? "+" : ""}$
                    {Math.abs(entry.totalPnl).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="col-span-1 text-center">
                    <span
                      className={`font-bold ${getGradeColor(entry.letterGrade)}`}
                    >
                      {entry.letterGrade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scoring Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>How Scores Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Prediction Score</p>
              <p>
                How accurate are your price predictions? Based on directional
                accuracy, magnitude, forecast edge, and thesis validity.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Performance Score</p>
              <p>
                How well do you execute trades? Based on entry timing, risk
                management, and actual returns vs market.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Letter Grades</p>
              <p>
                Grades range from FFF (worst) to AAA (best). C grade means
                market-average performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
