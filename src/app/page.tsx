import { getAllProjects } from "@/lib/storage";
import { getNavItems } from "@/lib/navigation";
import { getSiteContent } from "@/lib/content";
import { Navbar } from "@/components/Navbar";
import { HomeContent } from "@/components/HomeContent";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, navItems, content] = await Promise.all([
    getAllProjects(),
    getNavItems(),
    getSiteContent(),
  ]);

  return (
    <main className="min-h-screen">
      <Navbar items={navItems} brandName={content.brand.name} />
      <HomeContent initialProjects={projects} content={content} />
    </main>
  );
}
