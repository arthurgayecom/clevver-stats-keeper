import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface UserStats {
  carbonSaved: number;
  mealsTracked: number;
  impactScore: number;
  currentStreak: number;
}

interface LeaderboardProps {
  currentUserStats: UserStats;
  currentUserName: string;
}

const MOCK_LEADERBOARD = [
  { name: "Emma Green", carbonSaved: 45.2, rank: 1 },
  { name: "Liam Forest", carbonSaved: 38.7, rank: 2 },
  { name: "Sophia Meadow", carbonSaved: 32.1, rank: 3 },
  { name: "Noah River", carbonSaved: 28.9, rank: 4 },
  { name: "Olivia Sun", carbonSaved: 25.4, rank: 5 },
  { name: "William Oak", carbonSaved: 22.8, rank: 6 },
  { name: "Ava Bloom", carbonSaved: 19.3, rank: 7 },
  { name: "James Leaf", carbonSaved: 16.7, rank: 8 },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserStats, currentUserName }) => {
  // Calculate user's rank
  const userRank = MOCK_LEADERBOARD.filter(u => u.carbonSaved > currentUserStats.carbonSaved).length + 1;
  
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Your Position */}
      <Card variant="elevated" className="border-primary/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
              #{userRank}
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-lg">{currentUserName}</p>
              <p className="text-sm text-muted-foreground">Your position</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">{currentUserStats.carbonSaved.toFixed(1)} kg</p>
              <p className="text-sm text-muted-foreground">CO₂ saved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Users */}
      <div className="space-y-3">
        {MOCK_LEADERBOARD.map((user) => (
          <Card key={user.rank} variant="glass" className="hover-lift">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  {getRankIcon(user.rank)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{user.name}</p>
                </div>
                <p className="font-bold text-primary">{user.carbonSaved} kg</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
