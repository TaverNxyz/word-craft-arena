import { GameBoard } from "@/components/GameBoard";
import { Navigation } from "@/components/Navigation";
import { VelarixButton } from "@/components/VelarixButton";
import { ThreeBackground } from "@/components/ThreeBackground";

const Index = () => {
  return (
    <>
      <ThreeBackground />
      <Navigation />
      <GameBoard />
      <VelarixButton />
    </>
  );
};

export default Index;
