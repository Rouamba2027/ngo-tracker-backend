const mongoose = require("mongoose");
const request = require("http");

async function testAuth() {
  console.log("Testing auth endpoints...");
  // Use fetch to hit the API if it's running
  try {
    const fetch = (await import('node-fetch')).default;
    // 1. Register ONG
    const res1 = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ONG",
        name: "Test Admin",
        email: "admin@test.com",
        password: "password123",
        orgName: "Test ONG",
        receiptNumber: "REC-1234",
        country: "FR"
      })
    });
    const d1 = await res1.json();
    console.log("Register ONG:", d1);

    if (d1.orgCode) {
      // 2. Register MANAGER
      const res2 = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MANAGER",
          name: "Test Manager",
          email: "manager@test.com",
          password: "password123",
          orgCode: d1.orgCode
        })
      });
      const d2 = await res2.json();
      console.log("Register Manager:", d2);

      // 3. Login Manager
      const res3 = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "manager@test.com",
          password: "password123",
          role: "MANAGER",
          orgCode: d1.orgCode
        })
      });
      const d3 = await res3.json();
      console.log("Login Manager:", d3);
    }

  } catch (err) {
    console.error("Test failed:", err);
  }
}

testAuth();
