import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/GlassCard";

const Earn = () => {
  return (
    <Layout>
      <GlassCard className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Earn</h1>
        <p className="text-muted-foreground">Stake and earn rewards on your assets</p>
      </GlassCard>
    </Layout>
  );
};

export default Earn;
