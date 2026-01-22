import { Layout } from "@/components/layout";
import { GlassCard } from "@/components/ui/GlassCard";

const Portfolio = () => {
  return (
    <Layout>
      <GlassCard className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Portfolio</h1>
        <p className="text-muted-foreground">Connect a wallet to view your portfolio</p>
      </GlassCard>
    </Layout>
  );
};

export default Portfolio;
