const request = require("supertest");
const app = require("./app"); // Assuming your Express app is in app.js
const mongoose = require("mongoose");
const Contact = require("./models/contact");

// Use an in-memory database to avoid affecting real data
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    
    // 🔥 Disconnect the existing Mongoose connection before connecting to the in-memory DB
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  
    await mongoose.connect(mongoServer.getUri() );
  });
  

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Test Cases

//Test Case 1: Create a primary contact when no match exists
test("test_case_001: should create a primary contact", async () => {
  const res = await request(app).post("/identify").send({
    email: "test001@example.com",
    phone: "1111111111",
  });

  expect(res.status).toBe(200);
  expect(res.body.emails).toContain("test001@example.com");
  expect(res.body.phoneNumbers).toContain("1111111111");
  expect(res.body.secondaryContactIds).toHaveLength(0);
});

//Test Case 2: Merge secondary contact to existing primary
test("test_case_002: should link a new contact as secondary", async () => {
  await request(app).post("/identify").send({
    email: "test002@example.com",
    phone: "2222222222",
  });

  const res = await request(app).post("/identify").send({
    email: "test002@example.com",
    phone: "3333333333",
  });

  expect(res.status).toBe(200);
  expect(res.body.emails).toContain("test002@example.com");
  expect(res.body.phoneNumbers).toContain("2222222222");
  expect(res.body.phoneNumbers).toContain("3333333333");
  expect(res.body.secondaryContactIds.length).toBeGreaterThan(0);
});

//Test Case 3: Maintain primary when linked via secondary
test("test_case_003: should link indirectly connected contacts to the same primary", async () => {
  await request(app).post("/identify").send({
    email: "test003@example.com",
    phone: "4444444444",
  });

  await request(app).post("/identify").send({
    email: "test004@example.com",
    phone: "4444444444",
  });

  const res = await request(app).post("/identify").send({
    email: "test003@example.com",
    phone: "5555555555",
  });

  expect(res.status).toBe(200);
  expect(res.body.phoneNumbers).toContain("4444444444");
  expect(res.body.phoneNumbers).toContain("5555555555");
  expect(res.body.emails).toContain("test003@example.com");
  expect(res.body.emails).toContain("test004@example.com");
});

// Test Case 4: Handle duplicate contact without changes
test("test_case_004: should not create duplicate contacts", async () => {
  await request(app).post("/identify").send({
    email: "test005@example.com",
    phone: "6666666666",
  });

  const res = await request(app).post("/identify").send({
    email: "test005@example.com",
    phone: "6666666666",
  });

  expect(res.status).toBe(200);
  expect(res.body.emails).toContain("test005@example.com");
  expect(res.body.phoneNumbers).toContain("6666666666");
  expect(res.body.secondaryContactIds.length).toBe(0); // No new secondary contact
});
