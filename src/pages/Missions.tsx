import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/GlassCard";

const Missions = () => {
  return (
    <Layout>
      <GlassCard className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Missions</h1>
        <p className="text-muted-foreground">Complete missions to earn rewards</p>
      </GlassCard>
    </Layout>
  );
};

export default Missions;
