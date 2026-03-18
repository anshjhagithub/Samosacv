async function testApi() {
  const payload = {
    fullName: "Ansh Jha",
    targetRole: "Frontend Developer",
    experienceLevel: "1-3",
    experiences: [
      { jobTitle: "React Engineer", company: "TechCorp", duration: "2022-2024" }
    ],
    education: [
      { degree: "B.Tech", school: "University", duration: "2018-2022" }
    ],
    projects: [
      { title: "Portfolio Website", oneLiner: "Built with Next.js and Tailwind" }
    ]
  };

  try {
    const res = await fetch("https://samosacv.vercel.app/api/resume/generate-from-minimal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      console.log("Failed:", res.status, await res.text());
      return;
    }
    
    const data = await res.json();
    console.log("API returned HTTP 200.");
    console.log("Resume keys:", Object.keys(data.resume || {}));
    console.log("Personal:", JSON.stringify(data.resume?.personal, null, 2));
    console.log("Experience [0]:", JSON.stringify(data.resume?.experience?.[0], null, 2));
    console.log("Projects [0]:", JSON.stringify(data.resume?.projects?.[0], null, 2));
    console.log("Skills:", JSON.stringify(data.resume?.skills, null, 2));
  } catch(e) {
    console.error("Test script failed", e);
  }
}

testApi();
