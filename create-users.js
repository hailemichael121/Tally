const users = [
  {
    id: "tekta",
    name: "Tekta",
    loveName: "Shefafit",
    track: "males",
  },
  {
    id: "yihun",
    name: "Yihun",
    loveName: "Shebeto",
    track: "females",
  },
  {
    id: "yeabsra",
    name: "Yeabsra",
    loveName: "Faraw",
    track: "observer",
  },
];

async function createUsers() {
  try {
    const response = await fetch("http://localhost:4000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(users),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Users created successfully:");
      result.forEach((user) => {
        console.log(`   - ${user.loveName} (${user.name})`);
      });
    } else {
      console.log("❌ Error:", result);
    }
  } catch (error) {
    console.log("❌ Connection error:", error.message);
    console.log("��� Make sure your backend is running on port 4000");
  }
}

createUsers();
