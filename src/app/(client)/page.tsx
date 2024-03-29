import HeroSection from "./_components/Hero";
import AboutSection from "./_components/About";
import SkillsSection from "./_components/Skills";
import ProjectsSection from "./_components/Projects";
import DrawingsSection from "./_components/Drawings";
import ContactSection from "./_components/Contact";

import api from "@/services/api";

export default async function Home() {
  const { data: sectionsData } = await api.sections.findMany();

  const { hero, about, skills, projects, drawings } =
    api.sections.filterSections(
      ["hero", "about", "skills", "projects", "drawings"],
      sectionsData
    );

  const { data: skillsListData, error: skillsListError } =
    await api.skillsList.findMany();

  const { data: projectsData, error: projectsError } =
    await api.projects.findMany();

  const { data: drawingsGalleryData, error: drawingsGalleryError } =
    await api.drawings.findMany();

  return (
    <main className="min-h-screen">
      <HeroSection sectionData={hero} />
      <AboutSection sectionData={about} />
      <SkillsSection sectionData={skills} skillsList={skillsListData} />
      <ProjectsSection sectionData={projects} projectData={projectsData} />
      <DrawingsSection sectionData={drawings} drawings={drawingsGalleryData} />
      <ContactSection />
    </main>
  );
}
