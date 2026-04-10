import { SplashGate } from "@/components/SplashGate";
import { TournamentHomeClient } from "@/components/TournamentHomeClient";

export default function HomePage() {
  return (
    <SplashGate splashSrc="/efootball1.jpeg" ms={3000}>
      <TournamentHomeClient />
    </SplashGate>
  );
}
