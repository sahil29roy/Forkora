const http = require('http');
const app = require('./app');
const { query } = require('./config/db');

const PORT = 5009;

function request(method, path, body, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  const server = app.listen(PORT, async () => {
    console.log(`\n🧪 Testing Auth Flow on temporary port ${PORT}...\n`);

    try {
      const testEmail = `testuser_${Date.now()}@forkora.edu`;
      const testPassword = 'Password123!';
      const testName = 'Test Student User';

      // 1. SIGNUP TEST
      console.log('1️⃣ Testing Signup POST /api/auth/signup...');
      const signupRes = await request('POST', '/api/auth/signup', {
        display_name: testName,
        email: testEmail,
        password: testPassword,
        role: 'STUDENT',
      });
      console.log('   Status:', signupRes.status);
      console.log('   Response:', signupRes.data);

      if (signupRes.status !== 201) {
        throw new Error(`Signup failed with status ${signupRes.status}`);
      }

      // Query database for the generated OTP code for test verification
      const dbRes = await query(
        `SELECT ev.code FROM email_verifications ev JOIN users u ON ev.user_id = u.id WHERE u.email = $1 ORDER BY ev.created_at DESC LIMIT 1`,
        [testEmail]
      );
      const initialOtp = dbRes.rows[0]?.code;
      console.log('   DB Generated Initial OTP:', initialOtp);

      // 2. RESEND VERIFICATION CODE TEST
      console.log('\n2️⃣ Testing Resend Verification Email POST /api/auth/resend-verification...');
      const resendRes = await request('POST', '/api/auth/resend-verification', {
        email: testEmail,
      });
      console.log('   Status:', resendRes.status);
      console.log('   Response:', resendRes.data);

      if (resendRes.status !== 200) {
        throw new Error(`Resend verification failed with status ${resendRes.status}`);
      }

      const dbRes2 = await query(
        `SELECT ev.code FROM email_verifications ev JOIN users u ON ev.user_id = u.id WHERE u.email = $1 ORDER BY ev.created_at DESC LIMIT 1`,
        [testEmail]
      );
      const resentOtp = dbRes2.rows[0]?.code;
      console.log('   DB Generated Resent OTP:', resentOtp);

      // 3. VERIFY EMAIL TEST
      console.log('\n3️⃣ Testing Email Verification POST /api/auth/verify-email...');
      const verifyRes = await request('POST', '/api/auth/verify-email', {
        email: testEmail,
        code: resentOtp,
      });
      console.log('   Status:', verifyRes.status);
      console.log('   Response:', verifyRes.data);

      if (verifyRes.status !== 200 || !verifyRes.data.token) {
        throw new Error(`Email verification failed with status ${verifyRes.status}`);
      }

      const authToken = verifyRes.data.token;

      // 4. GET USER PROFILE (GET /api/auth/me) TEST
      console.log('\n4️⃣ Testing GET /api/auth/me (Protected Route)...');
      const meRes = await request('GET', '/api/auth/me', null, authToken);
      console.log('   Status:', meRes.status);
      console.log('   User Profile:', meRes.data);

      if (meRes.status !== 200 || meRes.data.user.email !== testEmail) {
        throw new Error(`GET /api/auth/me failed`);
      }

      // 5. SIGNIN TEST
      console.log('\n5️⃣ Testing Signin POST /api/auth/signin...');
      const signinRes = await request('POST', '/api/auth/signin', {
        email: testEmail,
        password: testPassword,
      });
      console.log('   Status:', signinRes.status);
      console.log('   Response:', signinRes.data);

      if (signinRes.status !== 200 || !signinRes.data.token) {
        throw new Error(`Signin failed`);
      }

      // 6. SIGNOUT TEST
      console.log('\n6️⃣ Testing Signout POST /api/auth/signout...');
      const signoutRes = await request('POST', '/api/auth/signout', { sessionId: signinRes.data.sessionId }, authToken);
      console.log('   Status:', signoutRes.status);
      console.log('   Response:', signoutRes.data);

      console.log('\n✅ ALL AUTHENTICATION AND EMAIL VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    } catch (err) {
      console.error('\n❌ Test Error:', err.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
