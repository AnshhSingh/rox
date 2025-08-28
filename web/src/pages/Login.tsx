import { Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { useAuth } from '../state/auth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (!ok) setError('Invalid credentials');
    else nav(user?.role === 'ADMIN' ? '/admin' : user?.role === 'OWNER' ? '/owner' : '/');
  };

  return (
    <Container size="xs" my="xl">
      <Title order={2}>Login</Title>
      <Paper withBorder p="md" mt="md" component="form" onSubmit={onSubmit}>
        <Stack>
          <TextInput label="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
          <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <Button type="submit">Login</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
