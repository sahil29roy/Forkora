import http from 'http';
import app from './app';
import { query } from './config/db';

const PORT = 5009;

function request(method: string, path: string, body: any = null, token: string | null = null): Promise<{ status: number; data?: any; raw?: string }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers: Record<string, string | number> = {
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
            resolve({ status: res.statusCode || 500, data: json });
          } catch (e) {
            resolve({ status: res.statusCode || 500, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests(): Promise<void> {
  const server = app.listen(PORT, async () => {
    console.log(`\n🧪 Testing Auth Flow on temporary port ${PORT}...\n`);

    try {
      const testEmail = `testuser_${Date.now()}@forkora.edu`;
      const testPassword = 'Password123!';
      const testName = 'Test Student User';

      // 0. CHECK EMAIL AVAILABILITY (BEFORE SIGNUP)
      console.log('0️⃣ Testing Check Email POST /api/auth/check-email (available)...');
      const checkAvailableRes = await request('POST', '/api/auth/check-email', { email: testEmail });
      console.log('   Status:', checkAvailableRes.status);
      console.log('   Response:', checkAvailableRes.data);
      if (checkAvailableRes.status !== 200 || checkAvailableRes.data.exists !== false) {
        throw new Error('Check email failed for available email');
      }

      // 1. SIGNUP TEST
      console.log('\n1️⃣ Testing Signup POST /api/auth/signup...');
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

      // 1b. DUPLICATE CHECK & SIGNUP TEST
      console.log('\n1b Testing Duplicate Email Check & Duplicate Signup...');
      const checkDuplicateRes = await request('POST', '/api/auth/check-email', { email: testEmail });
      console.log('   Check Duplicate Status:', checkDuplicateRes.status);
      console.log('   Check Duplicate Response:', checkDuplicateRes.data);
      if (checkDuplicateRes.status !== 200 || checkDuplicateRes.data.exists !== true) {
        throw new Error('Check email failed for existing duplicate email');
      }

      const duplicateSignupRes = await request('POST', '/api/auth/signup', {
        display_name: testName,
        email: testEmail,
        password: testPassword,
        role: 'STUDENT',
      });
      console.log('   Duplicate Signup Status:', duplicateSignupRes.status);
      console.log('   Duplicate Signup Response:', duplicateSignupRes.data);
      if (duplicateSignupRes.status !== 409) {
        throw new Error(`Expected 409 Conflict for duplicate signup, got ${duplicateSignupRes.status}`);
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

      // 7. FORGOT PASSWORD TEST
      console.log('\n7️⃣ Testing Forgot Password POST /api/auth/forgot-password...');
      const forgotRes = await request('POST', '/api/auth/forgot-password', { email: testEmail });
      console.log('   Status:', forgotRes.status);
      console.log('   Response:', forgotRes.data);
      if (forgotRes.status !== 200) {
        throw new Error('Forgot password request failed');
      }

      const resetDb = await query(
        `SELECT pr.code FROM password_resets pr JOIN users u ON pr.user_id = u.id WHERE u.email = $1 ORDER BY pr.created_at DESC LIMIT 1`,
        [testEmail]
      );
      const resetOtp = resetDb.rows[0]?.code;
      console.log('   DB Generated Reset OTP:', resetOtp);

      // 8. RESET PASSWORD TEST
      console.log('\n8️⃣ Testing Reset Password POST /api/auth/reset-password...');
      const newPassword = 'NewSecretPassword456!';
      const resetRes = await request('POST', '/api/auth/reset-password', {
        email: testEmail,
        code: resetOtp,
        newPassword,
      });
      console.log('   Status:', resetRes.status);
      console.log('   Response:', resetRes.data);
      if (resetRes.status !== 200) {
        throw new Error('Password reset failed');
      }

      // 9. SIGNIN WITH NEW PASSWORD TEST
      console.log('\n9️⃣ Testing Signin with NEW Password...');
      const newSigninRes = await request('POST', '/api/auth/signin', {
        email: testEmail,
        password: newPassword,
      });
      console.log('   Status:', newSigninRes.status);
      console.log('   Response:', newSigninRes.data);
      if (newSigninRes.status !== 200 || !newSigninRes.data.token) {
        throw new Error('Signin with new password failed');
      }

      console.log('\n✅ ALL AUTHENTICATION, EMAIL VERIFICATION, AND PASSWORD RESET TESTS PASSED SUCCESSFULLY!\n');
    } catch (err: any) {
      console.error('\n❌ Test Error:', err.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
