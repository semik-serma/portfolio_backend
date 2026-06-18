import axios from 'axios';

async function testApi() {
    try {
        console.log("Testing registration...");
        const regRes = await axios.post('http://localhost:2000/auth/register', {
            email: 'test' + Date.now() + '@example.com',
            firstname: 'Test',
            lastname: 'User',
            password: 'password123'
        });
        console.log("Registration response:", regRes.data);
    } catch (e) {
        console.error("Registration error:", e.response?.data || e.message);
    }
}

testApi();
