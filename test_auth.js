const mongoose = require("mongoose");

async function testAuth() {
  console.log("Testing auth endpoints...");
  try {
    const ts = Date.now();
    
    // 1. Register ONG
    const res1 = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Test Admin ${ts}`,
        email: `admin_${ts}@test.com`,
        password: "password123",
        orgName: `Test ONG ${ts}`,
        receiptNumber: `REC-${ts}`,
        country: "FR"
      })
    });
    const d1 = await res1.json();
    console.log("Register ONG:", d1);

    if (d1.token) {
      // 2. Login
      const res2 = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `admin_${ts}@test.com`,
          password: "password123"
        })
      });
      const d2 = await res2.json();
      console.log("Login Admin:", d2);
      
      // 3. Admin creates Manager
      const res3 = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${d1.token}`
        },
        body: JSON.stringify({
          name: "Manager 1",
          email: `mgr_${ts}@test.com`,
          password: "securepassword",
          role: "MANAGER"
        })
      });
      const d3 = await res3.json();
      console.log("Admin Create Manager:", d3);
    }

  } catch (err) {
    console.error("Test failed:", err);
  }
}

testAuth();
