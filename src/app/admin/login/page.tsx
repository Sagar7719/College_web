'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input, Button, Card, CardBody, Badge } from '@/components/ui';
import styles from '@/components/admin/admin.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      setIsLoading(false);
      const code = (err && typeof err === 'object' && 'code' in err) ? String(err.code) : '';
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setErrorMsg('Invalid email address or password. Please check your credentials.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('Access temporarily blocked due to multiple failed login attempts. Please try again later.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address format.');
      } else {
        setErrorMsg('Unable to sign in right now. Please verify your internet connection and try again.');
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard} variant="bordered">
        <CardBody className={styles.loginBody}>
          <div className={styles.loginLogoGroup}>
            <div className={styles.loginLogoBadge}>🎓</div>
            <h1 className={styles.headerTitle}>College CMS Admin</h1>
            <p className={styles.headerSubtitle}>
              Authenticated Administrator Portal
            </p>
          </div>

          {errorMsg && (
            <div className={styles.errorMessage} role="alert">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className={styles.loginForm}>
            <Input
              label="Admin Email Address"
              type="email"
              placeholder="admin@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button variant="primary" size="lg" type="submit" isLoading={isLoading} fullWidth>
              Sign In To CMS
            </Button>
          </form>

          <div className={styles.loginFooter}>
            <Badge variant="info">🔒 Protected Administrator Route</Badge>
            <p className={styles.footerText}>
              Public registration is disabled. Unauthorized access attempts are monitored.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
